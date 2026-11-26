import { Component, inject, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserState } from '@core/services/user-state';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBars, faSolidMagnifyingGlass, faSolidUser } from '@ng-icons/font-awesome/solid';
import { StudentLookup } from '../student-lookup/student-lookup';

@Component({
  imports: [NgIcon, RouterLink, StudentLookup],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidUser, faSolidBars })],
  selector: 'app-header',
  templateUrl: './header.html',
})
export class Header {
  userState = inject(UserState);
  heading = input<string>();
  toggleSidebar = output<void>();

  studentLookup = viewChild(StudentLookup);

  onToggleMobileSearch() {
    this.studentLookup()?.toggleMobile();
  }

  onOpenSidebar() {
    this.toggleSidebar.emit();
  }
}
