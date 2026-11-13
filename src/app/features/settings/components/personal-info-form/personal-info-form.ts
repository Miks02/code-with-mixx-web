import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidUser, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { UserState } from '@core/services/user-state';
import { Button } from '@shared/components/button/button';
import {
  createPersonalInfoForm,
  createPersonalInfoFormModel,
} from '@features/settings/factories/settings-factories';
import { UpdatePersonalInfoRequest } from '@features/settings/models/update-personal-info-request';
import { SettingsService } from '@features/settings/services/settings-service';
import { ToastService } from '@core/services/toast-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [provideIcons({ faSolidCheck, faSolidUser, faSolidXmark })],
  selector: 'app-personal-info-form',
  styleUrl: './personal-info-form.css',
  templateUrl: './personal-info-form.html',
})
export class PersonalInfoForm {
  private userState = inject(UserState);
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);

  requestModel = signal<UpdatePersonalInfoRequest>(
    createPersonalInfoFormModel(this.userState.userDetails()),
  );

  personalInfoForm = createPersonalInfoForm(this.requestModel);
  updateNameMutation = this.settingsService.updateNameMutation;
  isPending = this.settingsService.updateNameMutation.isPending;

  onCancel() {
    this.requestModel.set(createPersonalInfoFormModel(this.userState.userDetails()));
    this.personalInfoForm().reset();
  }

  onSubmit() {
    return submit(this.personalInfoForm, async () => {
      try {
        await this.updateNameMutation.mutateAsync(this.requestModel());
        this.personalInfoForm().reset();
        this.toastService.showSuccess('Lični podaci su uspešno ažurirani.');
      } catch (err) {
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
