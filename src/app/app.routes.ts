import { Routes } from '@angular/router';
import { authGuard } from '@core/guard/auth-guard';
import { guestGuard } from '@core/guard/guest-guard';
import { adminGuard } from '@core/guard/admin-guard';
import { pageTitle } from '@core/utilities/page-title';
import { HOME_STRUCTURED_DATA } from '@features/site/utilities/home-structured-data';
import { FAQ_STRUCTURED_DATA } from '@features/site/utilities/faq-structured-data';
import { SiteLayout } from '@layouts/site/site-layout/site-layout';
import { Subjects } from '@features/site/pages/subjects/subjects';
import { AboutProject } from '@features/site/pages/about-project/about-project';
import { Faq } from '@features/site/pages/faq/faq';
import { PrivacyPolicy } from '@features/site/pages/privacy-policy/privacy-policy';
import { TermsOfService } from '@features/site/pages/terms-of-service/terms-of-service';
import { AUTH_ROUTES } from '@features/auth';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('@layouts/auth/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: AUTH_ROUTES
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
        path: 'analytics',
        loadChildren: () => import('@features/analytics').then((m) => m.ANALYTICS_ROUTES),
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
        path: 'projects',
        loadChildren: () => import('@features/projects').then((m) => m.PROJECTS_ADMIN_ROUTES),
      },
      {
        path: 'classes',
        loadChildren: () => import('@features/classes').then((m) => m.CLASSES_ADMIN_ROUTES),
      },
      {
        path: 'inquiries',
        loadChildren: () => import('@features/inquiries').then((m) => m.INQUIRIES_ADMIN_ROUTES),
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
    component: SiteLayout,
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
        component: Subjects,
      },
      {
        title: pageTitle('O projektu'),
        path: 'about-project',
        data: {
          description:
            'Kako je napravljen CodeWithMixx: Angular 22 sa SSR-om, ASP.NET Core na .NET 10 i PostgreSQL. Arhitektura, prijava, obrada grešaka i javni kod na GitHubu.',
        },
        component: AboutProject,
      },
      {
        title: pageTitle('Česta pitanja'),
        path: 'faq',
        data: {
          description:
            'Odgovori na najčešća pitanja o privatnim časovima programiranja: cene, paketi, otkazivanje, povraćaj novca, seminarski i diplomski radovi, nalog i privatnost.',
          structuredData: FAQ_STRUCTURED_DATA,
        },
        component: Faq,
      },
      {
        title: pageTitle('Politika privatnosti'),
        path: 'privacy-policy',
        data: {
          description:
            'Koje podatke CodeWithMixx prikuplja, zašto, koliko dugo ih čuva, koje kolačiće koristi i kako možeš da ih vidiš, ispraviš ili obrišeš.',
        },
        component: PrivacyPolicy,
      },
      {
        title: pageTitle('Uslovi korišćenja'),
        path: 'terms-of-service',
        data: {
          description:
            'Kako se na CodeWithMixx zakazuju, otkazuju i plaćaju časovi i radovi, kada se novac vraća i ko vodi tvoj nalog dok studentski panel ne bude gotov.',
        },
        component: TermsOfService,
      },
      {
        title: pageTitle('Stranica nije pronađena'),
        path: '**',
        loadComponent: () => import('@core/components/not-found/not-found').then((c) => c.NotFound),
      },
    ],
  },
];
