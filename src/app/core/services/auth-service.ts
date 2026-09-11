import { HttpClient } from '@angular/common/http';
import { Service, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../features/auth/models/login-request';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, Observable } from 'rxjs';
import { ProblemDetails } from '../models/problem-details';
import { UserDetails } from '../models/user-details';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _userDetails: WritableSignal<UserDetails | null> = signal(null);

  loginMutation = injectMutation<UserDetails, ProblemDetails, LoginRequest>(() => ({
    mutationFn: async (request: LoginRequest) => lastValueFrom(this.login(request)),
    onSuccess: (data: UserDetails) => this._userDetails.set(data),
  }));

  getMeQuery = injectQuery<UserDetails, void>(() => ({
    queryKey: ['me'],
    queryFn: async () =>
      await lastValueFrom(
        this.http.get<UserDetails>(`${this.apiUrl}/auth/me`, { withCredentials: true }),
      ),
    onSuccess: (data: UserDetails) => this._userDetails.set(data),
    enabled: this._userDetails() === null,
  }));

  userDetails = computed(() => {
    const userDetails = this._userDetails();

    return userDetails ?? null;
  });
  isAuthenticated = computed(() => !!this.userDetails());

  private login(request: LoginRequest): Observable<UserDetails> {
    return this.http.post<UserDetails>(`${this.apiUrl}/auth/login`, request, {
      withCredentials: true,
    });
  }
}
