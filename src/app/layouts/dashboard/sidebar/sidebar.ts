import { Component, computed, inject, input, output } from '@angular/core';
import { AuthService } from '@core/services/auth-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowLeftLong,
  faSolidArrowRightFromBracket,
  faSolidBook,
  faSolidCalendar,
  faSolidChartArea,
  faSolidEnvelope,
  faSolidFile,
  faSolidGear,
  faSolidMoneyBillTransfer,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';
import { SidebarLink } from '../sidebar-link/sidebar-link';
import { RouterLink } from '@angular/router';
import { UserState } from '@core/services/user-state';

const ADMIN_LINKS = [
  { name: 'Analitika', icon: 'faSolidChartArea', navigateTo: '/admin/analytics' },
  { name: 'Predmeti', icon: 'faSolidBook', navigateTo: '/admin/subjects' },
  { name: 'Studenti', icon: 'faSolidUserGraduate', navigateTo: '/admin/students' },
  { name: 'Časovi', icon: 'faSolidCalendar', navigateTo: '/admin/classes' },
  { name: 'Projekti', icon: 'faSolidFile', navigateTo: '/admin/projects' },
  { name: 'Upiti', icon: 'faSolidEnvelope', navigateTo: '/admin/inquiries' },
  { name: 'Podešavanje', icon: 'faSolidGear', navigateTo: '/admin/settings' },
];

const STUDENT_LINKS = [
  { name: 'Analitika', icon: 'faSolidChartArea', navigateTo: '/student/analytics' },
  { name: 'Predmeti', icon: 'faSolidBook', navigateTo: '/student/subjects' },
  { name: 'Časovi', icon: 'faSolidCalendar', navigateTo: '/student/classes' },
  { name: 'Projekti', icon: 'faSolidFile', navigateTo: '/student/projects' },
  { name: 'Finansije', icon: 'faSolidMoneyBillTransfer', navigateTo: '/student/projects' },
  { name: 'Podešavanje', icon: 'faSolidGear', navigateTo: '/student/settings' },
];

@Component({
  imports: [SidebarLink, NgIcon, RouterLink],
  providers: [
    provideIcons({
      faSolidChartArea,
      faSolidUserGraduate,
      faSolidCalendar,
      faSolidFile,
      faSolidEnvelope,
      faSolidGear,
      faSolidArrowRightFromBracket,
      faSolidArrowLeftLong,
      faSolidBook,
      faSolidMoneyBillTransfer,
    }),
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  showSidebar = input(false);
  closeSidebar = output<void>();
  heading = input<string>('Naslov');

  private userState = inject(UserState);
  private authService = inject(AuthService);

  sidebarLinks = computed(() => {
    if (this.userState.isStudent()) return STUDENT_LINKS;
    if (this.userState.isAdmin()) return ADMIN_LINKS;

    return [];
  });

  onCloseSidebar() {
    this.closeSidebar.emit();
  }

  onLogout() {
    this.authService.logoutMutation.mutate();
  }
}
