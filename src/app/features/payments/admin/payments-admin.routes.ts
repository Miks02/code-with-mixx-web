import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const PAYMENTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Finansije'),
    path: '',
    loadComponent: () =>
      import('./pages/admin-payments-page/admin-payments-page').then((c) => c.AdminPaymentsPage),
  },
];
