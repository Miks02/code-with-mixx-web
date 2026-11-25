import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const ANALYTICS_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Analitika'),
    path: '',
    loadComponent: () =>
      import('./pages/admin-analytics-page/admin-analytics-page').then((c) => c.AdminAnalyticsPage),
  },
];
