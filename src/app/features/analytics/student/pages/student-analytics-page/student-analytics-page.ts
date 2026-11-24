import { Component, computed, inject } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { priceConverter } from '@core/utilities/price-helpers';
import { ActionBar, ActionButton } from '@features/analytics/components/action-bar/action-bar';
import {
  AnalyticsCard,
  AnalyticsCardItem,
} from '@features/analytics/components/analytics-card/analytics-card';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidChalkboardUser,
  faSolidFile,
  faSolidFileLines,
  faSolidMoneyBillTransfer,
  faSolidSackDollar,
  faSolidWallet,
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

const FAKE_STUDENT_ANALYTICS = {
  totalPaid: 48000,
  remainingDebt: 12000,
  completedClasses: 14,
  activeProjects: 2,
};

@Component({
  imports: [ActionBar, AnalyticsCard],
  providers: [
    provideIcons({
      faSolidFile,
      faSolidCalendar,
      faSolidMoneyBillTransfer,
      faSolidSackDollar,
      faSolidWallet,
      faSolidChalkboardUser,
      faSolidFileLines,
    }),
  ],
  selector: 'app-student-analytics-page',
  styleUrl: './student-analytics-page.css',
  templateUrl: './student-analytics-page.html',
})
export class StudentAnalyticsPage {
  userState = inject(UserState);
  studentActions = STUDENT_ACTIONS;

  analyticsCards = computed<AnalyticsCardItem[]>(() => {
    const data = FAKE_STUDENT_ANALYTICS;

    return [
      {
        title: 'Ukupno plaćeno',
        value: priceConverter(data.totalPaid),
        icon: 'faSolidSackDollar',
        variant: 'emerald',
      },
      {
        title: 'Dugovanje',
        value: priceConverter(data.remainingDebt),
        icon: 'faSolidWallet',
        variant: 'amber',
      },
      {
        title: 'Održani časovi',
        value: data.completedClasses,
        icon: 'faSolidChalkboardUser',
        variant: 'violet',
      },
      {
        title: 'Aktivni projekti',
        value: data.activeProjects,
        icon: 'faSolidFileLines',
        variant: 'sky',
      },
    ];
  });
}
