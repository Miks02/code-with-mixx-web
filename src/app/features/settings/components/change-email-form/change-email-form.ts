import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidEnvelope, faSolidLock } from '@ng-icons/font-awesome/solid';
import { UserState } from '@core/services/user-state';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import {
  createChangeEmailForm,
  createEmptyChangeEmailFormModel,
} from '@features/settings/factories/settings-factories';
import { ChangeEmailFormModel } from '@features/settings/models/change-email-form-model';
import { SettingsService } from '@features/settings/services/settings-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';
import { EmailTokenModal } from '../email-token-modal/email-token-modal';

@Component({
  imports: [NgIcon, Button, FormField, EmailTokenModal],
  providers: [provideIcons({ faSolidCheck, faSolidEnvelope, faSolidLock })],
  selector: 'app-change-email-form',
  styleUrl: './change-email-form.css',
  templateUrl: './change-email-form.html',
})
export class ChangeEmailForm {
  private toastService = inject(ToastService);
  private userState = inject(UserState);
  private settingsService = inject(SettingsService);
  private requestEmailTokenMutation = this.settingsService.requestEmailTokenMutation;

  isTokenModalVisible = signal(false);
  isTokenPending = this.requestEmailTokenMutation.isPending;

  currentEmail = this.userState.email;

  requestModel = signal<ChangeEmailFormModel>(createEmptyChangeEmailFormModel());
  changeEmailForm = createChangeEmailForm(this.requestModel, this.currentEmail);

  onSubmit() {
    return submit(this.changeEmailForm, async () => {
      try {
        await this.requestEmailTokenMutation.mutateAsync(this.requestModel());
        this.isTokenModalVisible.set(true);
      } catch (err) {
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }

  onEmailChanged() {
    this.requestModel.set(createEmptyChangeEmailFormModel());
    this.changeEmailForm().reset();
  }

  closeModal() {
    this.isTokenModalVisible.set(false);
  }
}
