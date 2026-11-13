import { Component, inject } from '@angular/core';
import { ChangeEmailForm } from '@features/settings/components/change-email-form/change-email-form';
import { ChangePasswordForm } from '@features/settings/components/change-password-form/change-password-form';
import { PersonalInfoForm } from '@features/settings/components/personal-info-form/personal-info-form';
import { PhoneNumberForm } from '@features/settings/components/phone-number-form/phone-number-form';
import { ProfileInfoCard } from '@features/settings/components/profile-info-card/profile-info-card';
import { SessionActions } from '@features/settings/components/session-actions/session-actions';
import { SettingsService } from '@features/settings/services/settings-service';
import { LoadingOverlay } from '@shared/components/loading-overlay/loading-overlay';

@Component({
  imports: [
    ProfileInfoCard,
    PersonalInfoForm,
    ChangeEmailForm,
    PhoneNumberForm,
    ChangePasswordForm,
    SessionActions,
    LoadingOverlay,
  ],
  selector: 'app-settings-page',
  styleUrl: './settings-page.css',
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private settingsService = inject(SettingsService);
  isPasswordChanging = this.settingsService.changePasswordMutation.isPending;
}
