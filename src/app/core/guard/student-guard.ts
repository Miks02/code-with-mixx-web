import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserState } from '@core/services/user-state';

export const studentGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userState = inject(UserState);

  return userState.isStudent() || router.createUrlTree(['/auth/login']);
};
