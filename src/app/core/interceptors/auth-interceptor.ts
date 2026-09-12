import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService, SKIP_AUTH_RETRY } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const skipAuthRetry = req.context.get(SKIP_AUTH_RETRY);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || skipAuthRetry) {
        return throwError(() => err);
      }

      return authService.rotateTokens().pipe(
        switchMap(() => next(req.clone({ withCredentials: true }))),
        catchError((refreshError: HttpErrorResponse) => {
          authService.handleSessionExpired();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
