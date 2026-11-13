import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidPhone, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { UserState } from '@core/services/user-state';
import { Button } from '@shared/components/button/button';
import {
  createPhoneNumberForm,
  createPhoneNumberFormModel,
} from '@features/settings/factories/settings-factories';
import { UpdatePhoneNumberRequest } from '@features/settings/models/update-phone-number-request';
import { SettingsService } from '@features/settings/services/settings-service';
import { ToastService } from '@core/services/toast-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [provideIcons({ faSolidCheck, faSolidPhone, faSolidXmark })],
  selector: 'app-phone-number-form',
  styleUrl: './phone-number-form.css',
  templateUrl: './phone-number-form.html',
})
export class PhoneNumberForm {
  private toastService = inject(ToastService);
  private userState = inject(UserState);
  private settingsService = inject(SettingsService);
  private updatePhoneNumberMutation = this.settingsService.updatePhoneNumberMutation;

  isPending = this.updatePhoneNumberMutation.isPending;

  requestModel = signal<UpdatePhoneNumberRequest>(
    createPhoneNumberFormModel(this.userState.userDetails()),
  );

  phoneNumberForm = createPhoneNumberForm(this.requestModel);

  onCancel() {
    this.requestModel.set(createPhoneNumberFormModel(this.userState.userDetails()));
    this.phoneNumberForm().reset();
  }

  onSubmit() {
    return submit(this.phoneNumberForm, async () => {
      try {
        await this.updatePhoneNumberMutation.mutateAsync(this.requestModel());
        this.toastService.showSuccess('Broj telefona je uspešno ažuriran');
      } catch (err) {
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
