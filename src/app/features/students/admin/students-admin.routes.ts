import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const STUDENTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Studenti'),
    path: '',
    loadComponent: () => import('./pages/students-page/students-page').then((c) => c.StudentsPage),
  },
  {
    title: pageTitle('Detalji studenta'),
    path: 'details/:id',
    loadComponent: () =>
      import('./pages/student-details-page/student-details-page').then((c) => c.StudentDetailsPage),
  },
];
