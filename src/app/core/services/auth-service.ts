import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../features/auth/models/login-request';
import { ProblemDetails } from '../models/problem-details';
import { UserDetails } from '../models/user-details';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _userDetails: WritableSignal<UserDetails | null> = signal(null);

  userDetails = computed(() => this._userDetails() ?? null);
  userRoles = computed<string[]>(() => this._userDetails()?.roles ?? []);
  isAuthenticated = computed(() => !!this.userDetails());
  isAdmin = computed(() => this._userDetails()?.roles.includes('Admin') ?? false);

  loginMutation = injectMutation<UserDetails, ProblemDetails, LoginRequest>(() => ({
    mutationFn: (request: LoginRequest) => lastValueFrom(this.login(request)),
    onSuccess: (data: UserDetails) => this._userDetails.set(data),
  }));

  logoutMutation = injectMutation<void, void, void>(() => ({
    mutationFn: () => lastValueFrom(this.logout()),
    onSettled: () => {
      this._userDetails.set(null);
      window.location.href = '/login';
    },
  }));

  getMeQuery = injectQuery<UserDetails, void>(() => ({
    queryKey: ['me'],
    queryFn: () =>
      lastValueFrom(
        this.http.get<UserDetails>(`${this.apiUrl}/auth/me`, { withCredentials: true }).pipe(
          tap((res) => {
            this._userDetails.set(res);
          }),
        ),
      ),
    enabled: this._userDetails() === null,
  }));

  private login(request: LoginRequest): Observable<UserDetails> {
    return this.http.post<UserDetails>(`${this.apiUrl}/auth/login`, request, {
      withCredentials: true,
    });
  }

  private logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
