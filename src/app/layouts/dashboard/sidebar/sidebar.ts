import { Component } from '@angular/core';
import { SidebarLink } from '../sidebar-link/sidebar-link';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    faSolidArrowLeftLong,
  faSolidArrowRightFromBracket,
  faSolidCalendar,
  faSolidChartArea,
  faSolidFile,
  faSolidGear,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';

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
      faSolidArrowLeftLong
    }),
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  SIDEBAR_LINKS = [
    { name: 'Analitika', icon: 'faSolidChartArea', navigateTo: '/dashboard' },
    { name: 'Studenti', icon: 'faSolidUserGraduate', navigateTo: '/students' },
    { name: 'Časovi', icon: 'faSolidCalendar', navigateTo: '/lessons' },
    { name: 'Projekti', icon: 'faSolidFile', navigateTo: '/projects' },
    { name: 'Podešavanje', icon: 'faSolidGear', navigateTo: '/settings' },
  ];
}
