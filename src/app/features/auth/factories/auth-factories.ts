import { WritableSignal } from '@angular/core';
import { debounce, email, form, minLength, required, validate } from '@angular/forms/signals';
import { ForgotPasswordRequest } from '../models/forgot-password-request';
import { LoginRequest } from '../models/login-request';
import { ResetPasswordBody } from '../models/reset-password-body';
import { AccountActivationBody } from '../models/account-activation-body';

export function createLoginForm(
  request: WritableSignal<LoginRequest>
) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.email, 100);
    debounce(schemaPath.password, 100);
    required(schemaPath.email, { message: 'Email adresa je obavezna' });
    email(schemaPath.email, { message: 'Email adresa nije validna' });
    required(schemaPath.password, { message: 'Lozinka je obavezna' });
  });
}

export function createForgotPasswordForm(request: WritableSignal<ForgotPasswordRequest>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.email, 100);
    required(schemaPath.email, { message: 'Email adresa je obavezna' });
    email(schemaPath.email, { message: 'Email adresa nije validna' });
  });
}

export function createResetPasswordForm(request: WritableSignal<ResetPasswordBody>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.password, 100);
    debounce(schemaPath.confirmedPassword, 100);
    required(schemaPath.password, { message: 'Nova lozinka je obavezna' });
    minLength(schemaPath.password, 8, { message: 'Lozinka mora imati najmanje 8 karaktera' });
    required(schemaPath.confirmedPassword, { message: 'Potvrda lozinke je obavezna' });
    validate(schemaPath.confirmedPassword, ({ value, valueOf }) =>
      value() === valueOf(schemaPath.password)
        ? null
        : { kind: 'passwordMismatch', message: 'Lozinke se ne poklapaju' },
    );
  });
}

export function createAccountActivationForm(request: WritableSignal<AccountActivationBody>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.password, 100);
    debounce(schemaPath.confirmedPassword, 100);
    required(schemaPath.password, { message: 'Lozinka je obavezna' });
    minLength(schemaPath.password, 8, { message: 'Lozinka mora imati najmanje 8 karaktera' });
    required(schemaPath.confirmedPassword, { message: 'Potvrda lozinke je obavezna' });
    validate(schemaPath.confirmedPassword, ({ value, valueOf }) =>
      value() === valueOf(schemaPath.password)
        ? null
        : { kind: 'passwordMismatch', message: 'Lozinke se ne poklapaju' },
    );
  });
}
