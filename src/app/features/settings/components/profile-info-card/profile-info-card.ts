import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidClockRotateLeft, faSolidShieldHalved } from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '@core/models/account-status';
import { UserState } from '@core/services/user-state';
import { dateConverter, timeConverter } from '@core/utilities/date-helpers';

type StatusMeta = {
  label: string;
  dot: string;
  text: string;
  icon: string;
  iconBg: string;
};

const STATUS_META: Record<AccountStatus, StatusMeta> = {
  [AccountStatus.Active]: {
    label: 'Aktivan',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    icon: 'text-emerald-400!',
    iconBg: 'bg-emerald-500/15',
  },
  [AccountStatus.Pending]: {
    label: 'Na čekanju',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    icon: 'text-amber-400!',
    iconBg: 'bg-amber-500/15',
  },
  [AccountStatus.Deactivated]: {
    label: 'Deaktiviran',
    dot: 'bg-zinc-400',
    text: 'text-zinc-300',
    icon: 'text-zinc-400!',
    iconBg: 'bg-zinc-500/15',
  },
  [AccountStatus.Deleted]: {
    label: 'Obrisan',
    dot: 'bg-red-400',
    text: 'text-red-300',
    icon: 'text-red-400!',
    iconBg: 'bg-red-500/15',
  },
};

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidClockRotateLeft, faSolidShieldHalved })],
  selector: 'app-profile-info-card',
  styleUrl: './profile-info-card.css',
  templateUrl: './profile-info-card.html',
})
export class ProfileInfoCard {
  private userState = inject(UserState);
  fullName = this.userState.fullName;
  roles = this.userState.userRoles;
  phoneNumber = this.userState.phoneNumber;
  email = this.userState.email;
  initials = this.userState.userInitials;

  status = computed(() => {
    const status = this.userState.accountStatus();
    return status ? STATUS_META[status] : null;
  });

  lastLoginDate = computed(() => {
    const lastLogin = this.userState.lastLogin();
    return lastLogin ? dateConverter(lastLogin) : '—';
  });

  lastLoginTime = computed(() => {
    const lastLogin = this.userState.lastLogin();
    return lastLogin ? timeConverter(lastLogin) : '';
  });
}
