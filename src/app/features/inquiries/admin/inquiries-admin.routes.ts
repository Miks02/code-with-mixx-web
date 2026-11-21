import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const INQUIRIES_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Upiti'),
    path: '',
    loadComponent: () =>
      import('./pages/inquiries-page/inquiries-page').then((c) => c.InquiriesPage),
  },
];
