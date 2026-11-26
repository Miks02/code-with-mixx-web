import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SETTINGS_STUDENT_ROUTES: Routes = [
  {
    title: pageTitle('Podešavanje'),
    path: '',
    loadComponent: () =>
      import('./pages/student-settings-page/student-settings-page').then(
        (c) => c.StudentSettingsPage,
      ),
  },
];
