import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SUBJECTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Predmeti'),
    path: '',
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('./pages/admin-subject-page/admin-subject-page').then((c) => c.AdminSubjectPage),
  },
];
