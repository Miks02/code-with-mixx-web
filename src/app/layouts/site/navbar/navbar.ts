import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightToBracket,
  faSolidBars,
  faSolidRightFromBracket,
  faSolidUser,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

@Component({
  host: { '(document:keydown.escape)': 'closeMenu()' },
  imports: [Button, NgIcon, RouterLink, RouterLinkActive],
  providers: [provideIcons({ faSolidBars, faSolidRightFromBracket, faSolidUser, faSolidXmark, faSolidArrowRightToBracket })],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  isAuthenticated = input.required<boolean>();
  logout = output<void>();

  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected onLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }
}
