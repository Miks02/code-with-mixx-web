import { Component, inject, OnInit, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidKey, faSolidLock, faSolidUserCheck } from '@ng-icons/font-awesome/solid';
import { AuthService } from '../../../../core/services/auth-service';
import { ToastService } from '../../../../core/services/toast-service';
import { Button } from '../../../../shared/button/button';
import { createAccountActivationForm } from '../../factories/auth-factories';
import { AccountActivationBody } from '../../models/account-activation-body';
import { AccountActivationRequest } from '../../models/account-activation-request';

@Component({
  imports: [NgIcon, FormField, Button, RouterLink],
  providers: [provideIcons({ faSolidKey, faSolidLock, faSolidUserCheck })],
  selector: 'app-account-activation',
  styleUrl: './account-activation.css',
  templateUrl: './account-activation.html',
})
export class AccountActivation implements OnInit {
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly token = this.activatedRoute.snapshot.queryParamMap.get('token');
  private readonly userId = this.activatedRoute.snapshot.queryParamMap.get('userId');

  ngOnInit() {
    history.replaceState(null, '', location.pathname);
  }

  activateAccountMutation = this.authService.activateAccountMutation;

  activationModel = signal<AccountActivationBody>({ password: '', confirmedPassword: '' });
  activationForm = createAccountActivationForm(this.activationModel);

  onSubmit() {
    return submit(this.activationForm, async () => {
      try {
        const request: AccountActivationRequest = {
          token: this.token!,
          userId: this.userId!,
          ...this.activationModel(),
        };
        await this.activateAccountMutation.mutateAsync(request);
        this.toastService.showSuccess('Nalog je uspešno aktiviran. Sada se možeš prijaviti.');
        await this.router.navigate(['/login']);
      } catch (err: any) {
        const errorCode = err?.error?.errorCode;
        if (errorCode === 'User.NotFound') {
          this.toastService.showError('Korisnik nije pronađen. Proveri link iz pozivnice.');
          return [];
        }
        if (errorCode === 'User.AlreadyActivated') {
          this.toastService.showInfo('Nalog je već aktiviran. Možeš se prijaviti.');
          await this.router.navigate(['/login']);
          return [];
        }
        if (errorCode === 'Auth.InvalidInvitationToken') {
          this.toastService.showError(
            'Link za aktivaciju nije validan ili je istekao. Obrati se administratoru za novu pozivnicu.',
          );
          return [];
        }
        this.toastService.showError('Došlo je do neočekivane greške. Pokušaj ponovo kasnije.');
      }
      return [];
    });
  }
}
