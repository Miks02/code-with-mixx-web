import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { computed } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.isAdmin();

  if(isAdmin) {
    return true;
  }

  return new Promise((resolve) => {
    authService.getMeQuery
      .refetch()
      .then((result) => {
        if (result.isSuccess && result.data.roles.includes('Admin')) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  });
};
