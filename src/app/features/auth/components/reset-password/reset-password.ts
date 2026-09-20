import { Component, inject, OnInit, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidKey, faSolidLock } from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../shared/button/button';
import { createResetPasswordForm } from '../../factories/auth-factories';
import { ResetPasswordBody } from '../../models/reset-password-body';
import { ToastService } from '../../../../core/services/toast-service';
import { AuthService } from '../../../../core/services/auth-service';
import { ResetPasswordRequest } from '../../models/reset-password-request';
  
@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidCheck, faSolidKey, faSolidLock })],
  selector: 'app-reset-password',
  styleUrl: './reset-password.css',
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private toastSerivce = inject(ToastService);
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly token = this.activatedRoute.snapshot.queryParamMap.get('token');
  private readonly userId = this.activatedRoute.snapshot.queryParamMap.get('userId');

  ngOnInit() {
    history.replaceState(null, '', location.pathname);
  }

  resetPasswordMutation = this.authService.resetPasswordMutation;

  resetPasswordModel = signal<ResetPasswordBody>({ password: '', confirmedPassword: '' });
  resetPasswordForm = createResetPasswordForm(this.resetPasswordModel);

  onSubmit() {
    return submit(this.resetPasswordForm, async () => {
      try {
        const request: ResetPasswordRequest = {
          token: this.token!,
          userId: this.userId!,
          ...this.resetPasswordModel(),
        };
        await this.resetPasswordMutation.mutateAsync(request);
        this.toastSerivce.showSuccess('Lozinka je uspešno resetovana.');
        await this.router.navigate(['/login']);
      } catch (error) {
        this.toastSerivce.showError(
          'Došlo je do greške prilikom resetovanja lozinke. Token nije validan.',
        );
      }
      return [];
    });
  }
}
