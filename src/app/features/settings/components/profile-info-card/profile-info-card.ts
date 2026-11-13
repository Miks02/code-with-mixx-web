import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidClockRotateLeft, faSolidShieldHalved } from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '@core/models/account-status';
import { UserDetails } from '@core/models/user-details';
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
  user = input.required<UserDetails>();

  fullName = computed(() => `${this.user().firstName} ${this.user().lastName}`);
  initials = computed(() => `${this.user().firstName[0]}${this.user().lastName[0]}`);
  roles = computed(() => this.user().roles);
  email = computed(() => this.user().email);
  phoneNumber = computed(() => this.user().phoneNumber);

  status = computed(() => STATUS_META[this.user().accountStatus] ?? null);

  lastLoginDate = computed(() => {
    const lastLogin = this.user().lastLogin;
    return lastLogin ? dateConverter(lastLogin) : '—';
  });

  lastLoginTime = computed(() => {
    const lastLogin = this.user().lastLogin;
    return lastLogin ? timeConverter(lastLogin) : '';
  });
}
