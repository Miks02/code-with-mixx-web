import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { catchError, finalize, lastValueFrom, map, Observable, of, shareReplay, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../features/auth/models/login-request';
import { ProblemDetails } from '../models/problem-details';
import { UserDetails } from '../models/user-details';

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

  loginMutation = injectMutation<UserDetails, ProblemDetails, LoginRequest>(() => ({
    mutationFn: (request: LoginRequest) => lastValueFrom(this.login(request)),
    onSuccess: (data: UserDetails) => {
      this._userDetails.set(data);
    },
  }));

  logoutMutation = injectMutation<void, void, void>(() => ({
    mutationFn: () => lastValueFrom(this.logout()),
    onSettled: () => window.location.href = '/login',
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
