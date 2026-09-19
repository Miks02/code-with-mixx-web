import { Component, computed, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEnvelope, faSolidPaperPlane } from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../shared/button/button';
import { createForgotPasswordForm } from '../../factories/auth-factories';
import { ForgotPasswordRequest } from '../../models/forgot-password-request';

@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidEnvelope, faSolidPaperPlane })],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  isOnCooldown = computed(() => this.cooldownDuration() > 0);
  cooldownDuration = signal(0);
  message = signal("");
  messageWrapper = signal({
    title: "",
    text: "",
  })
  
  forgotPasswordModel = signal<ForgotPasswordRequest>({ email: '' });
  forgotPasswordForm = createForgotPasswordForm(this.forgotPasswordModel);

  onSubmit() {
    return submit(this.forgotPasswordForm, async () => {
      this.createMessageWrapper("Zahtev je uspešno poslat!", "Ako postoji nalog s tim emailom, biće ti poslat email za resetovanje lozinke.");
      this.beginCooldown();
      return [];
    });
  }

  beginCooldown() {
    this.cooldownDuration.set(60);

    let interval = setInterval(() => {
      this.cooldownDuration.update((duration) => duration - 1);
      if (this.cooldownDuration() === 0)
        clearInterval(interval);
    }, 1000);
  }

  createMessageWrapper(title: string, text: string) {
    this.messageWrapper.set({ title, text });
  }
}
