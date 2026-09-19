import { debounce, email, form, minLength, required, validate } from '@angular/forms/signals';
import { LoginRequest } from '../models/login-request';
import { ForgotPasswordRequest } from '../models/forgot-password-request';
import { ResetPasswordRequest } from '../models/reset-password-request';
import { Signal, WritableSignal } from '@angular/core';
import { ProblemDetails } from '../../../core/models/problem-details';

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

export function createResetPasswordForm(request: WritableSignal<ResetPasswordRequest>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.password, 100);
    debounce(schemaPath.confirmPassword, 100);
    required(schemaPath.password, { message: 'Nova lozinka je obavezna' });
    minLength(schemaPath.password, 8, { message: 'Lozinka mora imati najmanje 8 karaktera' });
    required(schemaPath.confirmPassword, { message: 'Potvrda lozinke je obavezna' });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(schemaPath.password)
        ? null
        : { kind: 'passwordMismatch', message: 'Lozinke se ne poklapaju' },
    );
  });
}
