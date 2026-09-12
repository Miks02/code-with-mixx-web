import { Component, inject, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBars, faSolidBell, faSolidMagnifyingGlass, faSolidUser } from '@ng-icons/font-awesome/solid';
import { AuthService } from '../../../core/services/auth-service';


@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidUser, faSolidBell, faSolidBars })],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  authService = inject(AuthService);
  toggleSidebar = output<void>();

  onOpenSidebar() {
    this.toggleSidebar.emit();
  }

}
