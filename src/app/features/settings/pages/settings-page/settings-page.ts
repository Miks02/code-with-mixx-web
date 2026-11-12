import { Component, inject } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { ProfileInfoCard } from '@features/settings/components/profile-info-card/profile-info-card';

@Component({
  imports: [ProfileInfoCard],
  selector: 'app-settings-page',
  styleUrl: './settings-page.css',
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private userState = inject(UserState);
  userDetails = this.userState.userDetails;
}
