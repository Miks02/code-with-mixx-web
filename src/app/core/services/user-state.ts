import { computed, Service, signal, WritableSignal } from '@angular/core';
import { AccountStatus } from '@core/models/account-status';
import { UserDetails } from '@core/models/user-details';

@Service()
export class UserState {
  private _userDetails: WritableSignal<UserDetails | null> = signal(null);

  userDetails = this._userDetails.asReadonly();
  fullName = computed(() => {
    const details = this._userDetails();
    return details ? `${details.firstName} ${details.lastName}` : '';
  });
  firstName = computed(() => this._userDetails()?.firstName ?? '');
  lastName = computed(() => this._userDetails()?.lastName ?? '');
  phoneNumber = computed(() => this._userDetails()?.phoneNumber ?? '');
  email = computed(() => this._userDetails()?.email ?? '');
  userRoles = computed<string[]>(() => this._userDetails()?.roles ?? []);
  isAuthenticated = computed(() => !!this._userDetails());
  isAdmin = computed(() => this.userRoles().includes('Admin'));
  userInitials = computed(() => {
    const details = this._userDetails();
    return details ? `${details.firstName[0]}${details.lastName[0]}` : '';
  });
  activeSessions = computed(() => this._userDetails()?.activeSessions ?? []);
  activeSessionsCount = computed(() => this.activeSessions().length ?? 0);
  lastLogin = computed(() => this._userDetails()?.lastLogin ?? '');
  accountStatus = computed(() => this._userDetails()?.accountStatus ?? null);

  updateUserDetails(details: UserDetails | null): void {
    this._userDetails.set(details);
  }

  updateFirstName(firstName: string): void {
    this.patchUserDetails({ firstName });
  }

  updateLastName(lastName: string): void {
    this.patchUserDetails({ lastName });
  }

  updateFullName(firstName: string, lastName: string): void {
    this.patchUserDetails({ firstName, lastName });
  }

  updateEmail(email: string): void {
    this.patchUserDetails({ email });
  }

  updatePhoneNumber(phoneNumber: string): void {
    this.patchUserDetails({ phoneNumber });
  }

  updateAccountStatus(accountStatus: AccountStatus): void {
    this.patchUserDetails({ accountStatus });
  }

  removeActiveSession(sessionId: string): void {
    this._userDetails.update((details) =>
      details
        ? {
            ...details,
            activeSessions: details.activeSessions.filter((s) => s.sessionId !== sessionId),
          }
        : details,
    );
  }

  private patchUserDetails(changes: Partial<UserDetails>): void {
    this._userDetails.update((details) => (details ? { ...details, ...changes } : details));
  }
}
