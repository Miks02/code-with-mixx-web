import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const CLASSES_STUDENT_ROUTES: Routes = [
  {
    title: pageTitle('Detalji rezervacije'),
    path: 'details/:id',
    loadComponent: () =>
      import('./pages/student-class-reservation-details-page/student-class-reservation-details-page').then(
        (c) => c.StudentClassReservationDetailsPage,
      ),
  },
];
