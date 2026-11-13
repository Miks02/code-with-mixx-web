import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidComputer,
  faSolidMobileScreen,
  faSolidPowerOff,
  faSolidTabletScreenButton,
} from '@ng-icons/font-awesome/solid';
import { DialogResult } from '@core/components/dialog/dialog';
import { ActiveSession } from '@core/models/active-session';
import { Device } from '@core/models/device';
import { AuthService } from '@core/services/auth-service';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { UserState } from '@core/services/user-state';
import { Button } from '@shared/components/button/button';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';

const DEVICE_ICONS: Record<Device, string> = {
  [Device.Desktop]: 'faSolidComputer',
  [Device.Mobile]: 'faSolidMobileScreen',
  [Device.Tablet]: 'faSolidTabletScreenButton',
};

@Component({
  imports: [Button, NgIcon, SrDatePipe],
  providers: [
    provideIcons({
      faSolidArrowRightFromBracket,
      faSolidComputer,
      faSolidMobileScreen,
      faSolidPowerOff,
      faSolidTabletScreenButton,
    }),
  ],
  selector: 'app-session-actions',
  styleUrl: './session-actions.css',
  templateUrl: './session-actions.html',
})
export class SessionActions {
  private authService = inject(AuthService);
  private userState = inject(UserState);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  private logoutMutation = this.authService.logoutMutation;
  private logoutAllMutation = this.authService.logoutAllMutation;
  private logoutBySessionIdMutation = this.authService.logoutBySessionIdMutation;

  activeSessions = computed(() =>
    [...this.userState.activeSessions()].sort(
      (a, b) => Number(b.isCurrentSession) - Number(a.isCurrentSession),
    ),
  );

  deviceIcon(device: Device): string {
    return DEVICE_ICONS[device] ?? 'faSolidComputer';
  }

  isLoggingOut(session: ActiveSession): boolean {
    if (session.isCurrentSession) return this.logoutMutation.isPending();

    return (
      this.logoutBySessionIdMutation.isPending() &&
      this.logoutBySessionIdMutation.variables() === session.sessionId
    );
  }

  onLogout(session: ActiveSession) {
    if (session.isCurrentSession) {
      this.logoutMutation.mutate();
      return;
    }

    this.logoutBySessionIdMutation.mutate(session.sessionId, {
      onSuccess: () => {
        this.userState.removeActiveSession(session.sessionId);
        this.toastService.showSuccess('Uređaj je odjavljen.');
      },
      onError: () => {
        this.toastService.showError('Došlo je do greške prilikom odjave sa izabranog uređaja.');
      },
    });
  }

  async onLogoutAllDevices() {
    const dialogResult = await this.dialogService.showDialog({
      message: 'Da li sigurno želiš da se odjaviš sa svih uređaja?',
      title: 'Odjava',
    });

    if (dialogResult === DialogResult.Cancelled) return;

    this.logoutAllMutation.mutate();
  }
}
