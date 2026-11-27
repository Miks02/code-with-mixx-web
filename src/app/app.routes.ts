import { Routes } from '@angular/router';
import { authGuard } from '@core/guard/auth-guard';
import { guestGuard } from '@core/guard/guest-guard';
import { adminGuard } from '@core/guard/admin-guard';
import { SiteLayout } from '@layouts/site/site-layout/site-layout';
import { AUTH_ROUTES } from '@features/auth';
import { SITE_ROUTES } from '@features/site';
import { studentGuard } from '@core/guard/student-guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('@layouts/auth/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: AUTH_ROUTES,
  },
  {
    path: 'student',
    canActivate: [authGuard, studentGuard],
    data: { preloading: 'student' },
    loadComponent: () =>
      import('@layouts/dashboard/dashboard-layout/dashboard-layout').then((c) => c.DashboardLayout),
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        data: {
          heading: 'Analitika',
          preloading: 'student',
        },
        path: 'analytics',
        loadChildren: () => import('@features/analytics').then((m) => m.ANALYTICS_STUDENT_ROUTES),
      },
      {
        path: 'subjects',
        data: {
          heading: 'Predmeti',
          preloading: 'student',
        },
        loadChildren: () => import('@features/subjects').then((m) => m.SUBJECTS_STUDENT_ROUTES),
      },
      {
        data: {
          heading: 'Časovi',
          preloading: 'student',
        },
        path: 'classes',
        loadChildren: () => import('@features/classes').then((m) => m.CLASSES_STUDENT_ROUTES),
      },
      {
        data: {
          heading: 'Projekti',
          preloading: 'student',
        },
        path: 'projects',
        loadChildren: () => import('@features/projects').then((m) => m.PROJECTS_STUDENT_ROUTES),
      },
      {
        data: {
          heading: 'Finansije',
          preloading: 'student',
        },
        path: 'payments',
        loadChildren: () => import('@features/payments').then((m) => m.PAYMENTS_STUDENT_ROUTES),
      },
      {
        data: {
          heading: 'Podešavanje',
          preloading: 'student',
        },
        path: 'settings',
        loadChildren: () => import('@features/settings').then((m) => m.SETTINGS_STUDENT_ROUTES),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('@layouts/dashboard/dashboard-layout/dashboard-layout').then((c) => c.DashboardLayout),
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        data: {
          heading: 'Analitika',
          preloading: 'admin',
        },
        path: 'analytics',
        loadChildren: () => import('@features/analytics').then((m) => m.ANALYTICS_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Predmeti',
          preloading: 'admin',
        },
        path: 'subjects',
        loadChildren: () => import('@features/subjects').then((m) => m.SUBJECTS_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Studenti',
          preloading: 'admin',
        },
        path: 'students',
        loadChildren: () => import('@features/students').then((m) => m.STUDENTS_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Projekti',
          preloading: 'admin',
        },
        path: 'projects',
        loadChildren: () => import('@features/projects').then((m) => m.PROJECTS_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Časovi',
          preloading: 'admin',
        },
        path: 'classes',
        loadChildren: () => import('@features/classes').then((m) => m.CLASSES_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Upiti',
          preloading: 'admin',
        },
        path: 'inquiries',
        loadChildren: () => import('@features/inquiries').then((m) => m.INQUIRIES_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Podešavanje',
          preloading: 'admin',
        },
        path: 'settings',
        loadChildren: () => import('@features/settings').then((m) => m.SETTINGS_ADMIN_ROUTES),
      },
      {
        data: {
          heading: 'Finansije',
          preloading: 'admin',
        },
        path: 'payments',
        loadChildren: () => import('@features/payments').then((m) => m.PAYMENTS_ADMIN_ROUTES),
      },
    ],
  },
  {
    path: '',
    component: SiteLayout,
    children: SITE_ROUTES,
  },
];
