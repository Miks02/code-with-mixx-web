import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SUBJECTS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Predmeti'),
    path: '',
    loadComponent: () => import('./pages/subjects-page/subjects-page').then((c) => c.SubjectsPage),
  },
];
