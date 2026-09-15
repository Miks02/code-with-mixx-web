import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth-guard';
import { guestGuard } from './core/guard/guest-guard';
import { adminGuard } from './core/guard/admin-guard';
import { SubjectsPage } from './features/subjects/admin/pages/subjects-page/subjects-page';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth/auth-layout/auth-layout').then((c) => c.AuthLayout),
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
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./layouts/dashboard/dashboard-layout/dashboard-layout').then((c) => c.DashboardLayout),
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/pages/analytics-page/analytics-page').then((c) => c.AnalyticsPage),
      },
      {
        path: 'subjects',
        loadComponent: () => import('./features/subjects/admin/pages/subjects-page/subjects-page').then((c) => c.SubjectsPage),
      },
    ],
  },
];
