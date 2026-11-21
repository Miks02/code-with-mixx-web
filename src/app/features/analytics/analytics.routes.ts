import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const ANALYTICS_ROUTES: Routes = [
  {
    title: pageTitle('Analitika'),
    path: '',
    loadComponent: () =>
      import('./pages/analytics-page/analytics-page').then((c) => c.AnalyticsPage),
  },
];
