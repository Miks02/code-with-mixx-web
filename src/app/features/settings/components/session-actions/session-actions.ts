import { Component, inject } from '@angular/core';
import { DialogResult } from '@core/components/dialog/dialog';
import { AuthService } from '@core/services/auth-service';
import { DialogService } from '@core/services/dialog-service';
import { provideIcons } from '@ng-icons/core';
import { faSolidArrowRightFromBracket, faSolidPowerOff } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

@Component({
  imports: [Button],
  providers: [provideIcons({ faSolidArrowRightFromBracket, faSolidPowerOff })],
  selector: 'app-session-actions',
  styleUrl: './session-actions.css',
  templateUrl: './session-actions.html',
})
export class SessionActions {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private logoutMutation = this.authService.logoutMutation;
  private logoutAllMutation = this.authService.logoutAllMutation;

  onLogoutCurrentDevice() {
    this.logoutMutation.mutate();
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
