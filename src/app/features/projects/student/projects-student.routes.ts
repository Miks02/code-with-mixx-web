import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const PROJECTS_STUDENT_ROUTES: Routes = [
  {
    title: pageTitle('Projekti'),
    path: '',
    loadComponent: () =>
      import('./pages/student-projects-page/student-projects-page').then(
        (c) => c.StudentProjectsPage,
      ),
  },
  {
    title: pageTitle('Detalji rezervacije'),
    path: 'details/:id',
    loadComponent: () =>
      import('./pages/student-project-reservation-details-page/student-project-reservation-details-page').then(
        (c) => c.StudentProjectReservationDetailsPage,
      ),
  },
];
