import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBars, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

@Component({
  host: { '(document:keydown.escape)': 'closeMenu()' },
  imports: [Button, NgIcon, RouterLink, RouterLinkActive],
  providers: [provideIcons({ faSolidBars, faSolidXmark })],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
