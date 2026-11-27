import { Routes } from '@angular/router';

export const ANALYTICS_STUDENT_ROUTES: Routes = [
  {
    path: '',
    data: { preloading: 'student' },
    loadComponent: () =>
      import('./pages/student-analytics-page/student-analytics-page').then(
        (c) => c.StudentAnalyticsPage,
      ),
  },
];
