import { Component, inject } from '@angular/core';
import { UserState } from '@core/services/user-state';

@Component({
  imports: [],
  selector: 'app-profile-info-card',
  styleUrl: './profile-info-card.css',
  templateUrl: './profile-info-card.html',
})
export class ProfileInfoCard {
  private userState = inject(UserState);
  userDetails = this.userState.userDetails;
  fullName = this.userState.fullName;
  roles = this.userState.userRoles;
  phoneNumber = this.userState.phoneNumber;
  email = this.userState.email;
  initials = this.userState.userInitials;
}
