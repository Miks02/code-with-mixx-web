import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { catchError, finalize, lastValueFrom, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginRequest } from '@features/auth/models/login-request';
import { ProblemDetails } from '../models/problem-details';
import { UserDetails } from '../models/user-details';
import { ForgotPasswordRequest } from '@features/auth/models/forgot-password-request';
import { ResetPasswordRequest } from '@features/auth/models/reset-password-request';
import { AccountActivationRequest } from '@features/auth/models/account-activation-request';
import { UserState } from './user-state';

export const SKIP_AUTH_RETRY = new HttpContextToken<boolean>(() => false);
@Service()
export class AuthService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private userState = inject(UserState);

  private refreshInFlight$: Observable<void> | null = null;

  isOnCooldown = computed(() => this.cooldownDuration() > 0);
  cooldownDuration = signal(0);

  loginMutation = injectMutation<UserDetails, ProblemDetails, LoginRequest>(() => ({
    mutationFn: (request: LoginRequest) =>
      lastValueFrom(
        this.http.post<UserDetails>(`${this.apiUrl}/auth/login`, request, {
          context: new HttpContext().set(SKIP_AUTH_RETRY, true),
        }),
      ),
    onSuccess: (data: UserDetails) => {
      this.userState.updateUserDetails(data);
    },
  }));

  logoutMutation = injectMutation<void, void, void>(() => ({
    mutationFn: () => lastValueFrom(this.http.post<void>(`${this.apiUrl}/auth/logout`, {})),
    onSettled: () => {
      this.clearSessionCookie();
      window.location.href = '/login';
    },
  }));

  logoutAllMutation = injectMutation<void, void, void>(() => ({
    mutationFn: () => lastValueFrom(this.http.post<void>(`${this.apiUrl}/auth/logout-all`, {})),
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
        tap((user) => this.userState.updateUserDetails(user)),
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
    this.userState.updateUserDetails(null);
    this.http
      .post<void>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        finalize(() => {
          this.clearSessionCookie();
          window.location.href = '/login?expired=true';
        }),
      )
      .subscribe();
  }

  private beginCooldown() {
    this.cooldownDuration.set(60);

    const interval = setInterval(() => {
      this.cooldownDuration.update((duration) => duration - 1);
      if (this.cooldownDuration() === 0) clearInterval(interval);
    }, 1000);
  }

  private clearSessionCookie() {
    document.cookie = 'Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
