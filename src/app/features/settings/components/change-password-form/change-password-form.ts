import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCheck,
  faSolidEye,
  faSolidEyeSlash,
  faSolidKey,
  faSolidLock,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import {
  createChangePasswordForm,
  createEmptyChangePasswordFormModel,
} from '@features/settings/factories/settings-factories';
import { ChangePasswordRequest } from '@features/settings/models/change-password-request';
import { ToastService } from '@core/services/toast-service';
import { SettingsService } from '@features/settings/services/settings-service';
import { DialogService } from '@core/services/dialog-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';
import { DialogResult } from '@core/components/dialog/dialog';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
      faSolidCheck,
      faSolidEye,
      faSolidEyeSlash,
      faSolidKey,
      faSolidLock,
    }),
  ],
  selector: 'app-change-password-form',
  styleUrl: './change-password-form.css',
  templateUrl: './change-password-form.html',
})
export class ChangePasswordForm {
  private toastService = inject(ToastService);
  private settingsService = inject(SettingsService);
  private dialogService = inject(DialogService);

  private changePasswordMutation = this.settingsService.changePasswordMutation;

  requestModel = signal<ChangePasswordRequest>(createEmptyChangePasswordFormModel());

  changePasswordForm = createChangePasswordForm(this.requestModel);

  showPasswords = signal(false);

  onSubmit() {
    return submit(this.changePasswordForm, async () => {
      try {
        const dialogResult = await this.dialogService.showDialog({
          title: 'Promena lozinke',
          message: 'Izmena lozinke će te izlogovati sa svih uredjaja.',
        });

        if (dialogResult === DialogResult.Cancelled) return;

        await this.changePasswordMutation.mutateAsync(this.changePasswordForm().value());
        window.location.href = '/login';
      } catch (err) {
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
        return undefined;
      }
    });
  }
}
