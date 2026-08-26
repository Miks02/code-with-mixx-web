import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login').then((c) => c.Login),
      },
    ],
  },
];
