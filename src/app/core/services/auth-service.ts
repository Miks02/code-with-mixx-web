import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import {
  catchError,
  finalize,
  lastValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../features/auth/models/login-request';
import { ProblemDetails } from '../models/problem-details';
import { UserDetails } from '../models/user-details';
import { ForgotPasswordRequest } from '../../features/auth/models/forgot-password-request';
import { ResetPasswordRequest } from '../../features/auth/models/reset-password-request';
import { AccountActivationRequest } from '../../features/auth/models/account-activation-request';

export const SKIP_AUTH_RETRY = new HttpContextToken<boolean>(() => false);
@Service()
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _userDetails: WritableSignal<UserDetails | null> = signal(null);

  private refreshInFlight$: Observable<void> | null = null;

  userDetails = computed(() => this._userDetails() ?? null);
  userRoles = computed<string[]>(() => this._userDetails()?.roles ?? []);
  isAuthenticated = computed(() => !!this.userDetails());
  isAdmin = computed(() => this._userDetails()?.roles.includes('Admin') ?? false);
  isOnCooldown = computed(() => this.cooldownDuration() > 0);
  cooldownDuration = signal(0);

  loginMutation = injectMutation<UserDetails, ProblemDetails, LoginRequest>(() => ({
    mutationFn: (request: LoginRequest) => lastValueFrom(this.login(request)),
    onSuccess: (data: UserDetails) => {
      this._userDetails.set(data);
    },
  }));

  logoutMutation = injectMutation<void, void, void>(() => ({
    mutationFn: () => lastValueFrom(this.logout()),
    onSettled: () => (window.location.href = '/login'),
  }));

  getResetPasswordTokenMutation = injectMutation<void, ProblemDetails, ForgotPasswordRequest>(
    () => ({
      mutationFn: (request: ForgotPasswordRequest) =>
        lastValueFrom(this.http.post<void>(`${this.apiUrl}/auth/forgot-password`, request)),
      onMutate: () => {
        this.beginCooldown();
      },
    }),
  );

  resetPasswordMutation = injectMutation<void, ProblemDetails, ResetPasswordRequest>(() => ({
    mutationFn: (request: ResetPasswordRequest) =>
      lastValueFrom(
        this.http.post<void>(`${this.apiUrl}/auth/reset-password`, request, {
          context: new HttpContext().set(SKIP_AUTH_RETRY, true),
        }),
      ),
  }));

  activateAccountMutation = injectMutation<void, ProblemDetails, AccountActivationRequest>(() => ({
    mutationFn: (request: AccountActivationRequest) =>
      lastValueFrom(
        this.http.post<void>(`${this.apiUrl}/auth/activate-account`, request, {
          context: new HttpContext().set(SKIP_AUTH_RETRY, true),
        }),
      ),
  }));

  checkSession(): Promise<void> {
    if (!document.cookie.includes('Session')) {
      return Promise.resolve(void 0);
    }

    return lastValueFrom(
      this.http.get<UserDetails>(`${this.apiUrl}/auth/me`).pipe(
        tap((user) => {
          this._userDetails.set(user);
        }),
        map(() => void 0),
        catchError(() => of(void 0)),
      ),
    );
  }

  rotateTokens(): Observable<void> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<void>(
          `${this.apiUrl}/auth/rotate-tokens`,
          {},
          { context: new HttpContext().set(SKIP_AUTH_RETRY, true) },
        )
        .pipe(
          map(() => void 0),
          finalize(() => (this.refreshInFlight$ = null)),
          shareReplay(1),
        );
    }
    return this.refreshInFlight$;
  }

  handleSessionExpired(): void {
    this._userDetails.set(null);
    this.logout()
      .pipe(
        take(1),
        finalize(() => (window.location.href = '/login?expired=true')),
      )
      .subscribe();
  }

  private beginCooldown() {
    this.cooldownDuration.set(60);

    let interval = setInterval(() => {
      this.cooldownDuration.update((duration) => duration - 1);
      if (this.cooldownDuration() === 0) clearInterval(interval);
    }, 1000);
  }

  private login(request: LoginRequest): Observable<UserDetails> {
    return this.http.post<UserDetails>(`${this.apiUrl}/auth/login`, request, {
      context: new HttpContext().set(SKIP_AUTH_RETRY, true),
    });
  }

  private logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}).pipe(
      finalize(() => {
        document.cookie = 'Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }),
    );
  }
}
