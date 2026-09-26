import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth-guard';
import { guestGuard } from './core/guard/guest-guard';
import { adminGuard } from './core/guard/admin-guard';
import { resetPasswordGuardGuard } from './core/guard/reset-password-guard-guard';

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
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/components/forgot-password/forgot-password').then((c) => c.ForgotPassword),
      },
      {
        canActivate: [resetPasswordGuardGuard],
        path: 'reset-password',
        loadComponent: () => import('./features/auth/components/reset-password/reset-password').then((c) => c.ResetPassword),
      },
      {
        path: 'activate-account',
        loadComponent: () => import('./features/auth/components/account-activation/account-activation').then((c) => c.AccountActivation),
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
      {
        path: 'students',
        loadComponent: () => import('./features/students/pages/students-page/students-page').then((c) => c.StudentsPage),
      },
    ],
  },
];
