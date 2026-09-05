import { Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBars, faSolidBell, faSolidMagnifyingGlass, faSolidUser } from '@ng-icons/font-awesome/solid';


@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidUser, faSolidBell, faSolidBars })],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {

  toggleSidebar = output<void>();

  onOpenSidebar() {
    this.toggleSidebar.emit();
  }
  
}
