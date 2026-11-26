import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const PAYMENTS_STUDENT_ROUTES: Routes = [
  {
    title: pageTitle('Finansije'),
    path: '',
    loadComponent: () =>
      import('./pages/student-payments-page/student-payments-page').then(
        (c) => c.StudentPaymentsPage,
      ),
  },
];
