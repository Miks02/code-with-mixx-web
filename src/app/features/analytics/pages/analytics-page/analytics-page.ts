import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarPlus, faSolidFileCirclePlus, faSolidUser, faSolidUserPlus } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({faSolidUser, faSolidUserPlus, faSolidCalendarPlus, faSolidFileCirclePlus})],
  selector: 'app-analytics-page',
  styleUrl: './analytics-page.css',
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {}
