import { Routes } from '@angular/router';
import { pageTitle } from '@core/utilities/page-title';

export const CLASSES_ADMIN_ROUTES: Routes = [
  {
    title: pageTitle('Časovi'),
    path: '',
    loadComponent: () => import('./pages/classes-page/classes-page').then((c) => c.ClassesPage),
  },
  {
    title: pageTitle('Nova rezervacija'),
    path: 'create',
    loadComponent: () =>
      import('./pages/create-class-reservation-page/create-class-reservation-page').then(
        (c) => c.CreateClassReservationPage,
      ),
  },
  {
    title: pageTitle('Ažuriranje rezervacije'),
    path: 'update/:id',
    loadComponent: () =>
      import('./pages/class-reservation-update-page/class-reservation-update-page').then(
        (c) => c.ClassReservationUpdatePage,
      ),
  },
];
