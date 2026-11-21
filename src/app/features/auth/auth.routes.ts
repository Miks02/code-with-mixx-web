import { Routes } from "@angular/router";
import { resetPasswordGuardGuard } from "@core/guard/reset-password-guard-guard";
import { pageTitle } from "@core/utilities/page-title";

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    title: pageTitle('Prijava'),
    path: 'login',
    loadComponent: () => import('@features/auth/components/login/login').then((c) => c.Login),
  },
  {
    title: pageTitle('Zaboravljena lozinka'),
    path: 'forgot-password',
    loadComponent: () =>
      import('@features/auth/components/forgot-password/forgot-password').then(
        (c) => c.ForgotPassword,
      ),
  },
  {
    title: pageTitle('Reset lozinke'),
    canActivate: [resetPasswordGuardGuard],
    path: 'reset-password',
    loadComponent: () =>
      import('@features/auth/components/reset-password/reset-password').then(
        (c) => c.ResetPassword,
      ),
  },
  {
    title: pageTitle('Aktivacija naloga'),
    path: 'activate-account',
    loadComponent: () =>
      import('@features/auth/components/account-activation/account-activation').then(
        (c) => c.AccountActivation,
      ),
  },
]