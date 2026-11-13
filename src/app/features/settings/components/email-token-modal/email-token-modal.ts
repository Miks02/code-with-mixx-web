import { Component, inject, input, output, signal } from '@angular/core';
import { FieldTree, FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidEnvelopeOpenText, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { ToastService } from '@core/services/toast-service';
import { getErrorCode } from '@core/utilities/problem-details-helpers';
import { Button } from '@shared/components/button/button';
import {
  createChangeEmailRequest,
  createEmailTokenForm,
  createEmptyEmailTokenFormModel,
} from '@features/settings/factories/settings-factories';
import { ChangeEmailFormModel } from '@features/settings/models/change-email-form-model';
import { EmailTokenFormModel } from '@features/settings/models/email-token-form-model';
import { SettingsService } from '@features/settings/services/settings-service';
import { getSettingsErrorMessage } from '@features/settings/utilities/settings-error-messages';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [provideIcons({ faSolidCheck, faSolidEnvelopeOpenText, faSolidXmark })],
  selector: 'app-email-token-modal',
  styleUrl: './email-token-modal.css',
  templateUrl: './email-token-modal.html',
})
export class EmailTokenModal {
  private toastService = inject(ToastService);
  private settingsService = inject(SettingsService);

  isVisible = input.required<boolean>();
  emailForm = input.required<FieldTree<ChangeEmailFormModel>>();
  closed = output<void>();
  emailChanged = output<void>();

  changeEmailMutation = this.settingsService.changeEmailMutation;

  tokenModel = signal<EmailTokenFormModel>(createEmptyEmailTokenFormModel());
  tokenForm = createEmailTokenForm(this.tokenModel);

  onClose() {
    this.tokenModel.set(createEmptyEmailTokenFormModel());
    this.tokenForm().reset();
    this.closed.emit();
  }

  onSubmit() {
    return submit(this.tokenForm, async () => {
      try {
        await this.changeEmailMutation.mutateAsync(
          createChangeEmailRequest(this.emailForm()().value(), this.tokenModel().token),
        );
        this.toastService.showSuccess('Email adresa je uspešno promenjena.');
        this.emailChanged.emit();
        this.onClose();
        return undefined;
      } catch (err) {
        if (getErrorCode(err) === 'Auth.InvalidEmailResetToken') {
          return {
            kind: 'server',
            message: 'Kod nije ispravan ili je istekao.',
            fieldTree: this.tokenForm.token,
          };
        }
        const message = getSettingsErrorMessage(err);
        if (message) this.toastService.showError(message);
        return undefined;
      }
    });
  }
}
