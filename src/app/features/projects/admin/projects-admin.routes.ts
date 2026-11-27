import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const PROJECTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Projekti'),
    path: '',
    data: { preloading: 'admin' },
    loadComponent: () => import('./pages/projects-page/projects-page').then((c) => c.ProjectsPage),
  },
  {
    title: pageTitle('Nova rezervacija'),
    path: 'create',
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('./pages/create-project-reservation-page/create-project-reservation-page').then(
        (c) => c.CreateProjectReservationPage,
      ),
  },
  {
    title: pageTitle('Ažuriranje rezervacije'),
    path: 'update/:id',
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('./pages/project-reservation-update-page/project-reservation-update-page').then(
        (c) => c.ProjectReservationUpdatePage,
      ),
  },
  {
    title: pageTitle('Detalji rezervacije'),
    path: 'details/:id',
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('./pages/project-reservation-details-page/project-reservation-details-page').then(
        (c) => c.ProjectReservationDetailsPage,
      ),
  },
];
