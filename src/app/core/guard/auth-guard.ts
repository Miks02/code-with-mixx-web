import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = false;
  const router = inject(Router);
  if (!isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
