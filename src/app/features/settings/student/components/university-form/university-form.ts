import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBuildingColumns, faSolidCheck, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import {
  createUniversityForm,
  createUniversityFormModel,
} from '@features/settings/factories/settings-factories';
import { UpdateUniversityRequest } from '@features/settings/models/update-university-request';
import { SettingsService } from '@features/settings/services/settings-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';
import { UserState } from '@core/services/user-state';

@Component({
  imports: [NgIcon, Button, FormField, Panel],
  providers: [provideIcons({ faSolidBuildingColumns, faSolidCheck, faSolidXmark })],
  selector: 'app-university-form',
  templateUrl: './university-form.html',
})
export class UniversityForm {
  private toastService = inject(ToastService);
  private settingsService = inject(SettingsService);
  private updateUniversityMutation = this.settingsService.updateUniversityMutation;
  private userState = inject(UserState);

  isPending = this.updateUniversityMutation.isPending;

  requestModel = signal<UpdateUniversityRequest>(
    createUniversityFormModel(this.userState?.university()),
  );

  universityForm = createUniversityForm(this.requestModel);

  onCancel() {
    this.requestModel.set(createUniversityFormModel(this.userState.university()));
    this.universityForm().reset();
  }

  onSubmit() {
    return submit(this.universityForm, async () => {
      try {
        const res = await this.updateUniversityMutation.mutateAsync(this.requestModel());
        this.requestModel.set(createUniversityFormModel(res.university));
        this.universityForm().reset();
        this.toastService.showSuccess('Fakultet je uspešno ažuriran');
      } catch (err) {
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
