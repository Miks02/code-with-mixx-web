import { WritableSignal } from '@angular/core';
import { debounce, email, form, minLength, required, validate } from '@angular/forms/signals';
import { ChangeEmailRequest } from '../models/change-email-request';
import { ChangePasswordRequest } from '../models/change-password-request';
import { UpdatePersonalInfoRequest } from '../models/update-personal-info-request';
import { UpdatePhoneNumberRequest } from '../models/update-phone-number-request';

export function createPersonalInfoForm(request: WritableSignal<UpdatePersonalInfoRequest>) {
  return form(request, (schemaPath) => {
    required(schemaPath.firstName, { message: 'Ime je obavezno.' });
    required(schemaPath.lastName, { message: 'Prezime je obavezno.' });
  });
}

export function createChangeEmailForm(request: WritableSignal<ChangeEmailRequest>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.newEmail, 100);
    required(schemaPath.newEmail, { message: 'Nova email adresa je obavezna.' });
    email(schemaPath.newEmail, { message: 'Email adresa nije validna.' });
    required(schemaPath.password, { message: 'Lozinka je obavezna.' });
  });
}

export function createPhoneNumberForm(request: WritableSignal<UpdatePhoneNumberRequest>) {
  return form(request, (schemaPath) => {
    required(schemaPath.phoneNumber, { message: 'Broj telefona je obavezan.' });
  });
}

export function createChangePasswordForm(request: WritableSignal<ChangePasswordRequest>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.newPassword, 100);
    debounce(schemaPath.confirmPassword, 100);
    required(schemaPath.currentPassword, { message: 'Trenutna lozinka je obavezna.' });
    required(schemaPath.newPassword, { message: 'Nova lozinka je obavezna.' });
    minLength(schemaPath.newPassword, 8, { message: 'Lozinka mora imati najmanje 8 karaktera.' });
    required(schemaPath.confirmPassword, { message: 'Potvrda lozinke je obavezna.' });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(schemaPath.newPassword)
        ? null
        : { kind: 'passwordMismatch', message: 'Lozinke se ne poklapaju.' },
    );
  });
}
