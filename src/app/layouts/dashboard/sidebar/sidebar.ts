import { Component, input, output, inject } from '@angular/core';
import { SidebarLink } from '../sidebar-link/sidebar-link';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowLeftLong,
  faSolidArrowRightFromBracket,
  faSolidBook,
  faSolidCalendar,
  faSolidChartArea,
  faSolidFile,
  faSolidGear,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  imports: [SidebarLink, NgIcon],
  providers: [
    provideIcons({
      faSolidChartArea,
      faSolidUserGraduate,
      faSolidCalendar,
      faSolidFile,
      faSolidGear,
      faSolidArrowRightFromBracket,
      faSolidArrowLeftLong,
      faSolidBook,
    }),
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  SIDEBAR_LINKS = [
    { name: 'Analitika', icon: 'faSolidChartArea', navigateTo: '/admin/analytics' },
    { name: 'Predmeti', icon: 'faSolidBook', navigateTo: '/admin/subjects' },
    { name: 'Studenti', icon: 'faSolidUserGraduate', navigateTo: '/admin/students' },
    { name: 'Časovi', icon: 'faSolidCalendar', navigateTo: '/admin/lessons' },
    { name: 'Projekti', icon: 'faSolidFile', navigateTo: '/admin/projects' },
    { name: 'Podešavanje', icon: 'faSolidGear', navigateTo: '/admin/settings' },
  ];

  private authService = inject(AuthService);

  closeSidebar = output<void>();

  showSidebar = input(false);

  onCloseSidebar() {
    this.closeSidebar.emit();
  }

  onLogout() {
    this.authService.logoutMutation.mutate();
  }
}
