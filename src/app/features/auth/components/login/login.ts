import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    faSolidArrowRightToBracket,
    faSolidEnvelope,
    faSolidLock,
} from '@ng-icons/font-awesome/solid';
import { AuthService } from '../../../../core/services/auth-service';
import { Button } from '../../../../shared/button/button';
import { createLoginForm } from '../../factories/auth-factories';
import { LoginRequest } from '../../models/login-request';

@Component({
  imports: [NgIcon, FormField, Button],
  providers: [provideIcons({ faSolidEnvelope, faSolidLock, faSolidArrowRightToBracket })],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginModel = signal<LoginRequest>({ email: '', password: '' });
  private authService = inject(AuthService);
  private router = inject(Router);

  loginMutation = this.authService.loginMutation;
  loginForm = createLoginForm(this.loginModel);

  onSubmit() {
    return submit(this.loginForm, async () => {
      try {
        await this.loginMutation.mutateAsync(this.loginModel());
        await this.router.navigate(['/admin/analytics']);
        return [];
      } catch (err: any) {
        if (err.error.errorCode === 'Auth.LoginFailed') {
          return {
            kind: 'server',
            message: 'Prijava nije uspela. Proverite lozinku i email adresu.',
            fieldTree: this.loginForm.password,
          };
        }
        throw err;
      }
    });
  }
}
