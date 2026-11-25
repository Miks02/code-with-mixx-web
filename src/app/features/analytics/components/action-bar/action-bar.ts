import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidUser } from '@ng-icons/font-awesome/solid';
import { Button, ButtonVariant } from '@shared/components/button/button';

export type ActionButton = {
  label: string;
  variant: ButtonVariant;
  navigateTo: string;
  icon: string;
}

@Component({
  imports: [Button, RouterLink, NgIcon],
  providers: [provideIcons({faSolidUser})],
  selector: 'app-action-bar',
  styleUrl: './action-bar.css',
  templateUrl: './action-bar.html',
})
export class ActionBar {
  fullName = input.required<string>();
  roles = input.required<string[]>();
  actions = input<ActionButton[]>([]);
}
