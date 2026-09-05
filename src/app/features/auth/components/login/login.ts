import { Component, effect, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRightToBracket, faSolidEnvelope, faSolidLock } from '@ng-icons/font-awesome/solid';
import { LoginRequest } from '../../models/login-request';
import { debounce, email, form, FormField, required } from '@angular/forms/signals';
import { Button } from '../../../../shared/button/button';

@Component({
  imports: [NgIcon, FormField, Button],
  providers: [provideIcons({ faSolidEnvelope, faSolidLock, faSolidArrowRightToBracket })],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginModel = signal<LoginRequest>({ email: '', password: '' });

  loginForm = form(this.loginModel, (schemaPath) => {
    debounce(schemaPath.email, 100);
    debounce(schemaPath.password, 100);
    required(schemaPath.email, { message: 'Email adresa je obavezna' });
    email(schemaPath.email, { message: 'Email adresa nije validna' });
    required(schemaPath.password, { message: 'Lozinka je obavezna' });
  });
}
