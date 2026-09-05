import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidFileCirclePlus,
  faSolidUser,
  faSolidUserPlus,
} from '@ng-icons/font-awesome/solid';
import { AdminActionBar } from '../../components/admin-action-bar/admin-action-bar';

@Component({
  imports: [NgIcon, AdminActionBar],
  providers: [
    provideIcons({ faSolidUser, faSolidUserPlus, faSolidCalendarPlus, faSolidFileCirclePlus }),
  ],
  selector: 'app-analytics-page',
  styleUrl: './analytics-page.css',
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {}
