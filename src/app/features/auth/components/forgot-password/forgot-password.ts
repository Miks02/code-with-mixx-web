import { Component, computed, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEnvelope, faSolidPaperPlane } from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../shared/button/button';
import { createForgotPasswordForm } from '../../factories/auth-factories';
import { ForgotPasswordRequest } from '../../models/forgot-password-request';
import { AuthService } from '../../../../core/services/auth-service';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidEnvelope, faSolidPaperPlane })],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  
  messageWrapper = signal({
    title: '',
    text: '',
  });

  forgotPasswordModel = signal<ForgotPasswordRequest>({ email: '' });
  forgotPasswordForm = createForgotPasswordForm(this.forgotPasswordModel);

  isOnCooldown = this.authService.isOnCooldown
  cooldownDuration = this.authService.cooldownDuration;
  getResetPasswordTokenMutation = this.authService.getResetPasswordTokenMutation;
  isPending = this.getResetPasswordTokenMutation.isPending;

  onSubmit() {
    return submit(this.forgotPasswordForm, async () => {
      try {
        await this.getResetPasswordTokenMutation.mutateAsync(this.forgotPasswordModel());

        this.createMessageWrapper(
          'Zahtev je uspešno poslat!',
          'Ako postoji nalog s tim emailom, biće ti poslat email za resetovanje lozinke.',
        );
      } catch (err: any) {
        if (err?.status === 429) {
          this.toastService.showError('Previše zahteva. Pokušaj ponovo kasnije.', 'Greška 429');
          return [];
        }

        this.toastService.showError('Došlo je do neočekivane greške. Pokušaj ponovo kasnije.');
      }

      return [];
    });
  }

  private createMessageWrapper(title: string, text: string) {
    this.messageWrapper.set({ title, text });
  }
}
