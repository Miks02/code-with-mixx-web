import { Component, computed, inject } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { priceConverter } from '@core/utilities/price-helpers';
import { ActionBar, ActionButton } from '@features/analytics/components/action-bar/action-bar';
import {
  AnalyticsCard,
  AnalyticsCardItem,
} from '@features/analytics/components/analytics-card/analytics-card';
import { AnalyticsService } from '@features/analytics/services/analytics-service';
import { StudentUpcomingClasses } from '@features/analytics/student/components/student-upcoming-classes/student-upcoming-classes';
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
import { ActiveProjects } from '@features/analytics/student/components/active-projects/active-projects';
import { RecentPayments } from '@features/analytics/student/components/recent-payments/recent-payments';
import { OpenBalance } from '@features/analytics/student/components/open-balance/open-balance';
import { ClassReservations } from '@features/analytics/student/components/class-reservations/class-reservations';

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
  imports: [ActionBar, AnalyticsCard, StudentUpcomingClasses, ClassReservations, ActiveProjects, OpenBalance, RecentPayments],
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
  analyticsService = inject(AnalyticsService);
  userState = inject(UserState);
  studentActions = STUDENT_ACTIONS;

  private analyticsQuery = this.analyticsService.getStudentAnalyticsQuery();
  private analyticsData = this.analyticsQuery.data;

  isLoading = computed(() => this.analyticsQuery.isPending());
  analyticsCards = computed<AnalyticsCardItem[]>(() => {
    const data = this.analyticsData();

    return [
      {
        title: 'Ukupno plaćeno',
        value: priceConverter(data?.totalPaid ?? 0),
        icon: 'faSolidSackDollar',
        variant: 'emerald',
      },
      {
        title: 'Dugovanje',
        value: priceConverter(0),
        icon: 'faSolidWallet',
        variant: 'amber',
      },
      {
        title: 'Održani časovi',
        value: data?.completedClasses ?? 0,
        icon: 'faSolidChalkboardUser',
        variant: 'violet',
      },
      {
        title: 'Aktivni projekti',
        value: data?.activeProjects ?? 0,
        icon: 'faSolidFileLines',
        variant: 'sky',
      },
    ];
  });

  upcomingClasses = computed(() => this.analyticsData()?.upcomingClasses ?? []);
  classReservationsSummary = computed(() => this.analyticsData()?.classReservationsSummary);
  activeProjects = computed(() => this.analyticsData()?.activeProjectsList ?? []);
  openBalanceSummary = computed(() => this.analyticsData()?.openBalanceSummary);
  recentPayments = computed(() => this.analyticsData()?.recentPayments ?? []);
}
