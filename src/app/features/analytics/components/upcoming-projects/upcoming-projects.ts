import { Component, input } from '@angular/core';
import { UpcomingProject } from '../../models/upcoming-project';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DatePipe } from '@angular/common';
import { faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon, DatePipe],
  providers: [provideIcons({ faSolidCalendarXmark })],
  selector: 'app-upcoming-projects',
  styleUrl: './upcoming-projects.css',
  templateUrl: './upcoming-projects.html',
})
export class UpcomingProjects {
  upcomingProjects = input.required<UpcomingProject[] | undefined>();

  getInitials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
  
}
