import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { cameraWorldMatrix } from 'three/src/nodes/TSL.js';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated;

  if (isAuthenticated()) {
    return router.createUrlTree(['/admin/analytics']);
  }

  return new Promise((resolve) => {
    authService.getMeQuery.refetch().then((result) => {
      if (result.isSuccess && result.data) {
        console.log(result.data.roles);
        return resolve(router.createUrlTree(['/admin/analytics']));
      } else {
        return resolve(true);
      }
    });
  });
};
