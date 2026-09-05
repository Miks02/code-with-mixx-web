import { Component } from '@angular/core';
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

@Component({
  imports: [NgIcon, AdminActionBar, AnalyticsCard],
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
export class AnalyticsPage {}
