import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidKey, faSolidLock } from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../shared/button/button';
import { createResetPasswordForm } from '../../factories/auth-factories';
import { ResetPasswordRequest } from '../../models/reset-password-request';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidCheck, faSolidKey, faSolidLock })],
  selector: 'app-reset-password',
  styleUrl: './reset-password.css',
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private toastSerivce = inject(ToastService);
  private router = inject(Router);

  resetPasswordModel = signal<ResetPasswordRequest>({ password: '', confirmPassword: '' });
  resetPasswordForm = createResetPasswordForm(this.resetPasswordModel);

  onSubmit() {
    return submit(this.resetPasswordForm, async () => {
      this.toastSerivce.showSuccess('Lozinka je uspešno resetovana.', 'Reset lozinke');
      this.router.navigate(['/login']);
      return [];
    });
  }
}
