import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const PROJECTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Projekti'),
    path: '',
    loadComponent: () => import('./pages/projects-page/projects-page').then((c) => c.ProjectsPage),
  },
  {
    title: pageTitle('Nova rezervacija'),
    path: 'create',
    loadComponent: () =>
      import('./pages/create-project-reservation-page/create-project-reservation-page').then(
        (c) => c.CreateProjectReservationPage,
      ),
  },
  {
    title: pageTitle('Detalji rezervacije'),
    path: 'details/:id',
    loadComponent: () =>
      import('./pages/project-reservation-details-page/project-reservation-details-page').then(
        (c) => c.ProjectReservationDetailsPage,
      ),
  },
];
