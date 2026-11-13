import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { environment } from '@environments/environment';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { UpdatePersonalInfoRequest } from '../models/update-personal-info-request';
import { UserDetails } from '@core/models/user-details';
import { UpdatePhoneNumberRequest } from '../models/update-phone-number-request';
import { ChangeEmailRequest } from '../models/change-email-request';
import { ChangeEmailFormModel } from '../models/change-email-form-model';
import { ChangePasswordRequest } from '../models/change-password-request';

@Service()
export class SettingsService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private userState = inject(UserState);

  updateNameMutation = injectMutation(() => ({
    mutationFn: (request: UpdatePersonalInfoRequest) =>
      lastValueFrom(
        this.http.put<Pick<UserDetails, 'firstName' | 'lastName'>>(
          `${this.apiUrl}/account/name`,
          request,
        ),
      ),
    onSuccess: (res: Pick<UserDetails, 'firstName' | 'lastName'>) => {
      this.userState.updateFirstName(res.firstName);
      this.userState.updateLastName(res.lastName);
    },
  }));

  updatePhoneNumberMutation = injectMutation(() => ({
    mutationFn: (request: UpdatePhoneNumberRequest) =>
      lastValueFrom(
        this.http.put<Pick<UserDetails, 'phoneNumber'>>(
          `${this.apiUrl}/account/phone-number`,
          request,
        ),
      ),
    onSuccess: (res: Pick<UserDetails, 'phoneNumber'>) => {
      this.userState.updatePhoneNumber(res.phoneNumber);
    },
  }));

  requestEmailTokenMutation = injectMutation(() => ({
    mutationFn: (request: ChangeEmailFormModel) =>
      lastValueFrom(this.http.post(`${this.apiUrl}/account/email-change-request`, request)),
  }));

  changeEmailMutation = injectMutation(() => ({
    mutationFn: (request: ChangeEmailRequest) =>
      lastValueFrom(
        this.http.post<Pick<UserDetails, 'email'>>(`${this.apiUrl}/account/email`, request),
      ),
    onSuccess: (res: Pick<UserDetails, 'email'>) => {
      this.userState.updateEmail(res.email);
    },
  }));

  changePasswordMutation = injectMutation(() => ({
    mutationFn: (request: ChangePasswordRequest) =>
      lastValueFrom(this.http.put(`${this.apiUrl}/account/password`, request)),
  }));
}
