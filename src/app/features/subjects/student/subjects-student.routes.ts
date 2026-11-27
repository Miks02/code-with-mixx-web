import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const SUBJECTS_STUDENT_ROUTES: Routes = [
  {
    title: pageTitle('Predmeti'),
    path: '',
    data: { preloading: 'student' },
    loadComponent: () =>
      import('./pages/student-subject-page/student-subject-page').then((c) => c.StudentSubjectPage),
  },
];
