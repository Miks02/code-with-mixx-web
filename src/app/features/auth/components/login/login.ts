import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEnvelope, faSolidLock } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({faSolidEnvelope, faSolidLock})],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {}
