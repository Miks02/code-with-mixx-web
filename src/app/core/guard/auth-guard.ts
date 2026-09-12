import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated;

  if (!isAuthenticated()) {
    return new Promise((resolve) => {
      authService.getMeQuery.refetch().then((result) => {
        if (result.isSuccess && result.data) {
          return resolve(true);
        } else {
          return resolve(router.createUrlTree(['/login']));
        }
      });
    });
  }

  return true;
};
