import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth-guard';
import { guestGuard } from './core/guard/guest-guard';
import { adminGuard } from './core/guard/admin-guard';
import { resetPasswordGuardGuard } from './core/guard/reset-password-guard-guard';

export const pageTitle = (title: string) => `${title} • CodeWithMixx`;

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
        title: pageTitle('Prijava'),
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login').then((c) => c.Login),
      },
      {
        title: pageTitle('Zaboravljena lozinka'),
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/components/forgot-password/forgot-password').then(
            (c) => c.ForgotPassword,
          ),
      },
      {
        title: pageTitle('Reset lozinke'),
        canActivate: [resetPasswordGuardGuard],
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/components/reset-password/reset-password').then(
            (c) => c.ResetPassword,
          ),
      },
      {
        title: pageTitle('Aktivacija naloga'),
        path: 'activate-account',
        loadComponent: () =>
          import('./features/auth/components/account-activation/account-activation').then(
            (c) => c.AccountActivation,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./layouts/dashboard/dashboard-layout/dashboard-layout').then(
        (c) => c.DashboardLayout,
      ),
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        title: pageTitle('Analitika'),
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/pages/analytics-page/analytics-page').then(
            (c) => c.AnalyticsPage,
          ),
      },
      {
        title: pageTitle('Predmeti'),
        path: 'subjects',
        loadComponent: () =>
          import('./features/subjects/admin/pages/subjects-page/subjects-page').then(
            (c) => c.SubjectsPage,
          ),
      },
      {
        title: pageTitle('Studenti'),
        path: 'students',
        loadComponent: () =>
          import('./features/students/pages/students-page/students-page').then(
            (c) => c.StudentsPage,
          ),
      },
      {
        title: pageTitle('Projekti'),
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/admin/pages/projects-page/projects-page').then(
            (c) => c.ProjectsPage,
          ),
      },
      {
        title: pageTitle('Nova rezervacija'),
        path: 'projects/create',
        loadComponent: () =>
          import('./features/projects/admin/pages/create-project-reservation-page/create-project-reservation-page').then(
            (c) => c.CreateProjectReservationPage,
          ),
      },
      {
        title: pageTitle('Detalji rezervacije'),
        path: 'projects/details/:id',
        loadComponent: () =>
          import('./features/projects/admin/pages/project-reservation-details-page/project-reservation-details-page').then(
            (c) => c.ProjectReservationDetailsPage,
          ),
      },
    ],
  },
];
