import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SETTINGS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Podešavanje'),
    path: '',
    data: { preloading: 'admin' },
    loadComponent: () =>
      import('./pages/admin-settings-page/admin-settings-page').then((c) => c.AdminSettingsPage),
  },
];
