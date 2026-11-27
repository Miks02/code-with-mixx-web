import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';
import { HOME_STRUCTURED_DATA } from './utilities/home-structured-data';
import { FAQ_STRUCTURED_DATA } from './utilities/faq-structured-data';
import { Subjects } from './pages/subjects/subjects';
import { AboutProject } from './pages/about-project/about-project';
import { Faq } from './pages/faq/faq';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsOfService } from './pages/terms-of-service/terms-of-service';

export const SITE_ROUTES: Routes = [
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
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
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
        'Kako se na CodeWithMixx zakazuju, otkazuju i plaćaju časovi i radovi, kada se novac vraća i kako radi tvoj nalog i studentski panel.',
    },
    component: TermsOfService,
  },
  {
    title: pageTitle('Stranica nije pronađena'),
    path: '**',
    loadComponent: () => import('@core/components/not-found/not-found').then((c) => c.NotFound),
  },
];
