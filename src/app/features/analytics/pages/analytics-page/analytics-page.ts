import { Component, signal, Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidChalkboardUser,
  faSolidFileCirclePlus,
  faSolidFileLines,
  faSolidSackDollar,
  faSolidUser,
  faSolidUserGraduate,
  faSolidUserPlus,
} from '@ng-icons/font-awesome/solid';
import { AdminActionBar } from '../../components/admin-action-bar/admin-action-bar';
import { AnalyticsCard } from '../../components/analytics-card/analytics-card';
import { FinanceChart } from '../../components/finance-chart/finance-chart';
import { SubjectsChart } from '../../components/subjects-chart/subjects-chart';
import { UpcomingClasses } from '../../components/upcoming-classes/upcoming-classes';
import { UpcomingClass } from '../../models/upcoming-class-';
import { UpcomingProject } from '../../models/upcoming-project';
import { UpcomingProjects } from '../../components/upcoming-projects/upcoming-projects';

@Component({
  imports: [
    AdminActionBar,
    AnalyticsCard,
    FinanceChart,
    SubjectsChart,
    UpcomingClasses,
    UpcomingProjects,
  ],
  providers: [
    provideIcons({
      faSolidUser,
      faSolidUserPlus,
      faSolidCalendarPlus,
      faSolidFileCirclePlus,
      faSolidChalkboardUser,
      faSolidUserGraduate,
      faSolidSackDollar,
      faSolidFileLines,
    }),
  ],
  selector: 'app-analytics-page',
  styleUrl: './analytics-page.css',
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {
  upcomingClasses: Signal<UpcomingClass[]> = signal([
    {
      id: 1,
      subjectName: 'Praktikum primenjenog programiranja',
      studentName: 'Marko Jovanović',
      startsAt: '2026-09-07T10:00:00',
      endsAt: '2026-09-07T11:30:00',
    },
    {
      id: 2,
      subjectName: 'Web programiranje',
      studentName: 'Ana Petrović',
      startsAt: '2026-09-07T12:00:00',
      endsAt: '2026-09-07T13:30:00',
    },
    {
      id: 3,
      subjectName: 'Napredne baze podataka',
      studentName: 'Nikola Simić',
      startsAt: '2026-09-08T09:00:00',
      endsAt: '2026-09-08T10:30:00',
    },
    {
      id: 4,
      subjectName: 'Programerski alati',
      studentName: 'Milica Đorđević',
      startsAt: '2026-09-08T14:00:00',
      endsAt: '2026-09-08T15:00:00',
    },
    {
      id: 5,
      subjectName: 'Osnove C programiranja',
      studentName: 'Stefan Ilić',
      startsAt: '2026-09-09T11:00:00',
      endsAt: '2026-09-09T12:30:00',
    },
    {
      id: 6,
      subjectName: 'Web programiranje',
      studentName: 'Jovana Stanković',
      startsAt: '2026-09-09T16:00:00',
      endsAt: '2026-09-09T17:00:00',
    },
  ]);

  upcomingProjects: Signal<UpcomingProject[]> = signal([
    {
      id: 1,
      subjectName: 'Praktikum primenjenog programiranja',
      studentName: 'Marko Jovanović',
      startDate: '2026-09-10',
      endDate: '2026-09-24',
    },
    {
      id: 2,
      subjectName: 'Web programiranje',
      studentName: 'Ana Petrović',
      startDate: '2026-09-12',
      endDate: '2026-09-30',
    },
    {
      id: 3,
      subjectName: 'Napredne baze podataka',
      studentName: 'Nikola Simić',
      startDate: '2026-09-15',
      endDate: '2026-10-01',
    },
    {
      id: 4,
      subjectName: 'Programerski alati',
      studentName: 'Milica Đorđević',
      startDate: '2026-09-08',
      endDate: '2026-09-20',
    },
    {
      id: 5,
      subjectName: 'Osnove C programiranja',
      studentName: 'Stefan Ilić',
      startDate: '2026-09-18',
      endDate: '2026-10-05',
    },
    {
      id: 6,
      subjectName: 'Web programiranje',
      studentName: 'Jovana Stanković',
      startDate: '2026-09-22',
      endDate: '2026-10-10',
    },
  ]);
}
