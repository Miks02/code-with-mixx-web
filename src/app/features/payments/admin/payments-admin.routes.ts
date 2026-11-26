import { Routes } from '@angular/router';

export const PAYMENTS_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/payments/admin/pages/admin-payments-page/admin-payments-page').then(
        (c) => c.AdminPaymentsPage,
      ),
  },
];
