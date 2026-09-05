import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = true;
  const router = inject(Router);
  if (isAuthenticated) {
    return router.createUrlTree(['/analytics']);
  }

  return true;
};
