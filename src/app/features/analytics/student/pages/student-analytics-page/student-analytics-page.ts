import { Component, inject } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { ActionBar, ActionButton } from '@features/analytics/components/action-bar/action-bar';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidFile,
  faSolidMoneyBillTransfer,
} from '@ng-icons/font-awesome/solid';

const STUDENT_ACTIONS: ActionButton[] = [
  {
    variant: 'ghost',
    label: 'Moji projekti',
    icon: 'faSolidFile',
    navigateTo: '/student/projects',
  },
  {
    variant: 'ghost',
    label: 'Moji časovi',
    icon: 'faSolidCalendar',
    navigateTo: '/student/classes',
  },
  {
    variant: 'secondary',
    label: 'Finansije',
    icon: 'faSolidMoneyBillTransfer',
    navigateTo: '/student/payments',
  },
];

@Component({
  imports: [ActionBar],
  providers: [provideIcons({ faSolidFile, faSolidCalendar, faSolidMoneyBillTransfer })],
  selector: 'app-student-analytics-page',
  styleUrl: './student-analytics-page.css',
  templateUrl: './student-analytics-page.html',
})
export class StudentAnalyticsPage {
  userState = inject(UserState);
  studentActions = STUDENT_ACTIONS;
}
