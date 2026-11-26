import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SETTINGS_ROUTES: Routes = [
  {
    title: pageTitle('Podešavanje'),
    path: '',
    loadComponent: () =>
      import('./admin/pages/admin-settings-page/admin-settings-page').then(
        (c) => c.AdminSettingsPage,
      ),
  },
];
