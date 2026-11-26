import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpcomingProject } from '@features/analytics/admin/models/upcoming-project';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarDays, faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Panel } from '@shared/components/panel/panel';
import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  imports: [NgIcon, DatePipe, RouterLink, Skeleton, Panel, EmptyState],
  providers: [provideIcons({ faSolidCalendarDays, faSolidCalendarXmark })],
  selector: 'app-upcoming-projects',
  templateUrl: './upcoming-projects.html',
})
export class UpcomingProjects {
  upcomingProjects = input.required<UpcomingProject[] | undefined>();
  isLoading = input<boolean>(false);

  getInitials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
