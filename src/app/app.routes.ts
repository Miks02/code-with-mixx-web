import { Routes } from '@angular/router';
import { authGuard } from '@core/guard/auth-guard';
import { guestGuard } from '@core/guard/guest-guard';
import { adminGuard } from '@core/guard/admin-guard';
import { resetPasswordGuardGuard } from '@core/guard/reset-password-guard-guard';
import { HOME_STRUCTURED_DATA } from '@features/site/utilities/home-structured-data';

export const pageTitle = (title: string) => `${title} • CodeWithMixx`;

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('@layouts/auth/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        title: pageTitle('Prijava'),
        path: 'login',
        loadComponent: () => import('@features/auth/components/login/login').then((c) => c.Login),
      },
      {
        title: pageTitle('Zaboravljena lozinka'),
        path: 'forgot-password',
        loadComponent: () =>
          import('@features/auth/components/forgot-password/forgot-password').then(
            (c) => c.ForgotPassword,
          ),
      },
      {
        title: pageTitle('Reset lozinke'),
        canActivate: [resetPasswordGuardGuard],
        path: 'reset-password',
        loadComponent: () =>
          import('@features/auth/components/reset-password/reset-password').then(
            (c) => c.ResetPassword,
          ),
      },
      {
        title: pageTitle('Aktivacija naloga'),
        path: 'activate-account',
        loadComponent: () =>
          import('@features/auth/components/account-activation/account-activation').then(
            (c) => c.AccountActivation,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@layouts/dashboard/dashboard-layout/dashboard-layout').then((c) => c.DashboardLayout),
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
          import('@features/analytics/pages/analytics-page/analytics-page').then(
            (c) => c.AnalyticsPage,
          ),
      },
      {
        title: pageTitle('Predmeti'),
        path: 'subjects',
        loadComponent: () =>
          import('@features/subjects/admin/pages/subjects-page/subjects-page').then(
            (c) => c.SubjectsPage,
          ),
      },
      {
        title: pageTitle('Studenti'),
        path: 'students',
        loadComponent: () =>
          import('@features/students/admin/pages/students-page/students-page').then(
            (c) => c.StudentsPage,
          ),
      },
      {
        title: pageTitle('Detalji studenta'),
        path: 'students/details/:id',
        loadComponent: () =>
          import('@features/students/admin/pages/student-details-page/student-details-page').then(
            (c) => c.StudentDetailsPage,
          ),
      },
      {
        title: pageTitle('Projekti'),
        path: 'projects',
        loadComponent: () =>
          import('@features/projects/admin/pages/projects-page/projects-page').then(
            (c) => c.ProjectsPage,
          ),
      },
      {
        title: pageTitle('Nova rezervacija'),
        path: 'projects/create',
        loadComponent: () =>
          import('@features/projects/admin/pages/create-project-reservation-page/create-project-reservation-page').then(
            (c) => c.CreateProjectReservationPage,
          ),
      },
      {
        title: pageTitle('Detalji rezervacije'),
        path: 'projects/details/:id',
        loadComponent: () =>
          import('@features/projects/admin/pages/project-reservation-details-page/project-reservation-details-page').then(
            (c) => c.ProjectReservationDetailsPage,
          ),
      },
      {
        title: pageTitle('Časovi'),
        path: 'classes',
        loadComponent: () =>
          import('@features/classes/admin/pages/classes-page/classes-page').then(
            (c) => c.ClassesPage,
          ),
      },
      {
        title: pageTitle('Nova rezervacija'),
        path: 'classes/create',
        loadComponent: () =>
          import('@features/classes/admin/pages/create-class-reservation-page/create-class-reservation-page').then(
            (c) => c.CreateClassReservationPage,
          ),
      },
      {
        title: pageTitle('Detalji rezervacije'),
        path: 'classes/details/:id',
        loadComponent: () =>
          import('@features/classes/admin/pages/class-reservation-details-page/class-reservation-details-page').then(
            (c) => c.ClassReservationDetailsPage,
          ),
      },
      {
        title: pageTitle('Upiti'),
        path: 'inquiries',
        loadComponent: () =>
          import('@features/inquiries/admin/pages/inquiries-page/inquiries-page').then(
            (c) => c.InquiriesPage,
          ),
      },
      {
        title: pageTitle('Podešavanje'),
        path: 'settings',
        loadComponent: () =>
          import('@features/settings/pages/settings-page/settings-page').then(
            (c) => c.SettingsPage,
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('@layouts/site/site-layout/site-layout').then((c) => c.SiteLayout),
    children: [
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        title: pageTitle('Privatni časovi programiranja'),
        path: '',
        data: {
          description:
            'Online privatni časovi programiranja i IT predmeta za studente: C, Java, C#, Python, OOP, web i baze podataka, uz pomoć oko seminarskih i diplomskih radova.',
          structuredData: HOME_STRUCTURED_DATA,
        },
        loadComponent: () => import('@features/site/pages/home/home').then((c) => c.Home),
      },
      {
        title: pageTitle('Predmeti'),
        path: 'subjects',
        data: {
          description:
            'Predmeti iz kojih držim privatne časove: programiranje u C-u, Javi, C#-u i Pythonu, OOP, web razvoj i baze podataka, sa temama koje prolazimo.',
        },
        loadComponent: () =>
          import('@features/site/pages/subjects/subjects').then((c) => c.Subjects),
      },
      {
        title: pageTitle('O projektu'),
        path: 'about-project',
        data: {
          description:
            'Kako je napravljen CodeWithMixx: Angular 22 sa SSR-om, ASP.NET Core na .NET 10 i PostgreSQL. Arhitektura, prijava, obrada grešaka i javni kod na GitHubu.',
        },
        loadComponent: () =>
          import('@features/site/pages/about-project/about-project').then((c) => c.AboutProject),
      },
      {
        title: pageTitle('Politika privatnosti'),
        path: 'privacy-policy',
        data: {
          description:
            'Koje podatke CodeWithMixx prikuplja, zašto, koliko dugo ih čuva, koje kolačiće koristi i kako možeš da ih vidiš, ispraviš ili obrišeš.',
        },
        loadComponent: () =>
          import('@features/site/pages/privacy-policy/privacy-policy').then((c) => c.PrivacyPolicy),
      },
      {
        title: pageTitle('Uslovi korišćenja'),
        path: 'terms-of-service',
        data: {
          description:
            'Kako se na CodeWithMixx zakazuju, otkazuju i plaćaju časovi i radovi, kada se novac vraća i ko vodi tvoj nalog dok studentski panel ne bude gotov.',
        },
        loadComponent: () =>
          import('@features/site/pages/terms-of-service/terms-of-service').then(
            (c) => c.TermsOfService,
          ),
      },
      {
        title: pageTitle('Stranica nije pronađena'),
        path: '**',
        loadComponent: () => import('@core/components/not-found/not-found').then((c) => c.NotFound),
      },
    ],
  },
];
