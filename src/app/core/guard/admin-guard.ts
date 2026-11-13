import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserState } from '../services/user-state';

export const adminGuard: CanActivateFn = () => {
  const userState = inject(UserState);
  const router = inject(Router);

  return userState.isAdmin() || router.createUrlTree(['/login']);
};
