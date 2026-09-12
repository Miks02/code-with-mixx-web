import { debounce, email, form, required, validate } from '@angular/forms/signals';
import { LoginRequest } from '../models/login-request';
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
