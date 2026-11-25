import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { dateConverter, daysUntil } from '@core/utilities/date-helpers';
import { StudentUpcomingProject } from '@features/analytics/student/models/student-upcoming-project';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidFileContract,
  faSolidFolderOpen,
} from '@ng-icons/font-awesome/solid';

function dayLabel(days: number) {
  return days % 10 === 1 && days % 100 !== 11 ? `${days} dan` : `${days} dana`;
}

function deadlineLabel(daysLeft: number) {
  if (daysLeft < 0) return `kasni ${dayLabel(-daysLeft)}`;
  if (daysLeft === 0) return 'ističe danas';
  return `za ${dayLabel(daysLeft)}`;
}

@Component({
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ faSolidCalendar, faSolidFileContract, faSolidFolderOpen })],
  selector: 'app-active-projects',
  templateUrl: './active-projects.html',
})
export class ActiveProjects {
  projects = input.required<StudentUpcomingProject[]>();

  projectCards = computed(() =>
    this.projects().map((project) => {
      const daysLeft = daysUntil(project.endDate);

      return {
        ...project,
        deadline: dateConverter(project.endDate, { day: '2-digit', month: '2-digit' }),
        deadlineLabel: deadlineLabel(daysLeft),
        isOverdue: daysLeft < 0,
      };
    }),
  );
}
