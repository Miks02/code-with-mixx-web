import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightToBracket,
  faSolidEnvelope,
  faSolidLock,
} from '@ng-icons/font-awesome/solid';
import { AuthService } from '@core/services/auth-service';
import { Button } from '@shared/components/button/button';
import { createLoginForm } from '@features/auth/factories/auth-factories';
import { LoginRequest } from '@features/auth/models/login-request';
import { getErrorCode } from '@core/utilities/problem-details-helpers';
import { ToastService } from '@core/services/toast-service';
import { getAuthErrorMessage } from '@features/auth/utilities/auth-error-messages';

@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidEnvelope, faSolidLock, faSolidArrowRightToBracket })],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginModel = signal<LoginRequest>({ email: '', password: '' });
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  constructor() {
    if (this.activatedRoute.snapshot.queryParamMap.get('expired') === 'true') {
      history.replaceState(null, '', location.pathname);
      this.toastService.showInfo('Tvoja sesija je istekla. Prijavi se ponovo.');
    }
  }

  loginMutation = this.authService.loginMutation;
  loginForm = createLoginForm(this.loginModel);

  onSubmit() {
    return submit(this.loginForm, async () => {
      try {
        await this.loginMutation.mutateAsync(this.loginModel());
        await this.router.navigate(['/admin/analytics']);
        return [];
      } catch (err) {
        if (getErrorCode(err) === 'Auth.LoginFailed') {
          return {
            kind: 'server',
            message: 'Prijava nije uspela. Proveri lozinku i email adresu.',
            fieldTree: this.loginForm.password,
          };
        }
        const message = getAuthErrorMessage(err);
        if (message) {
          this.toastService.showError(message);
          return;
        }
        throw err;
      }
    });
  }
}
