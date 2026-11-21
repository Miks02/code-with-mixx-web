import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SETTINGS_ROUTES: Routes = [
  {
    title: pageTitle('Podešavanje'),
    path: '',
    loadComponent: () => import('./pages/settings-page/settings-page').then((c) => c.SettingsPage),
  },
];
