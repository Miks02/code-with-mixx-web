import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { UserState } from '@core/services/user-state';
import { priceConverter } from '@core/utilities/price-helpers';
import { ActionBar, ActionButton } from '@features/analytics/components/action-bar/action-bar';
import { AnalyticsCard } from '@features/analytics/components/analytics-card/analytics-card';
import { FinanceChart } from '@features/analytics/admin/components/finance-chart/finance-chart';
import { SubjectsChart } from '@features/analytics/admin/components/subjects-chart/subjects-chart';
import { UpcomingClasses } from '@features/analytics/admin/components/upcoming-classes/upcoming-classes';
import { UpcomingProjects } from '@features/analytics/admin/components/upcoming-projects/upcoming-projects';
import { AdminQueryParams } from '@features/analytics/admin/models/admin-query-params';
import { AnalyticsService } from '@features/analytics/services/analytics-service';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidChalkboardUser,
  faSolidFileCirclePlus,
  faSolidFileLines,
  faSolidSackDollar,
  faSolidUserGraduate,
  faSolidUserPlus,
} from '@ng-icons/font-awesome/solid';

const ADMIN_ACTIONS: ActionButton[] = [
  {
    variant: 'ghost',
    label: 'Dodaj studenta',
    icon: 'faSolidUserPlus',
    navigateTo: '/admin/students',
  },
  {
    variant: 'ghost',
    label: 'Dodaj projekat',
    icon: 'faSolidFileCirclePlus',
    navigateTo: '/admin/projects/create',
  },
  {
    variant: 'secondary',
    label: 'Zakaži čas',
    icon: 'faSolidCalendarPlus',
    navigateTo: '/admin/classes/create',
  },
];

@Component({
  imports: [
    ActionBar,
    AnalyticsCard,
    FinanceChart,
    SubjectsChart,
    UpcomingClasses,
    UpcomingProjects,
  ],
  providers: [
    provideIcons({
      faSolidUserPlus,
      faSolidCalendarPlus,
      faSolidFileCirclePlus,
      faSolidChalkboardUser,
      faSolidUserGraduate,
      faSolidSackDollar,
      faSolidFileLines,
    }),
  ],
  selector: 'app-admin-analytics-page',
  styleUrl: './admin-analytics-page.css',
  templateUrl: './admin-analytics-page.html',
})
export class AdminAnalyticsPage {
  private queryParams: WritableSignal<AdminQueryParams> = signal({
    selectedYearForFinanceChart: new Date().getFullYear(),
    selectedYearForSubjectsChart: new Date().getFullYear(),
  });
  private analyticsService = inject(AnalyticsService);
  userState = inject(UserState);
  adminActions = ADMIN_ACTIONS;

  analyticsQuery = this.analyticsService.getAdminAnalyticsQuery(this.queryParams);
  analyticsData = computed(() => this.analyticsQuery.data());
  isLoading = computed(() => this.analyticsQuery.isPending());

  completedClasses = computed(() => this.analyticsData()?.completedClasses ?? 0);
  completedProjects = computed(() => this.analyticsData()?.completedProjects ?? 0);
  totalRevenue = computed(() => priceConverter(this.analyticsData()?.totalRevenue ?? 0));
  totalStudents = computed(() => this.analyticsData()?.totalStudents ?? 0);
  upcomingClasses = computed(() => this.analyticsData()?.upcomingClasses);
  upcomingProjects = computed(() => this.analyticsData()?.upcomingProjects);

  availableYearsForSubjectsChart = computed(
    () => this.analyticsData()?.availableYearsForSubjectsChart ?? [],
  );
  availableYearsForFinanceChart = computed(
    () => this.analyticsData()?.availableYearsForFinanceChart ?? [],
  );
  selectedYearForSubjectsChart = computed(() => this.queryParams().selectedYearForSubjectsChart);
  selectedYearForFinanceChart = computed(() => this.queryParams().selectedYearForFinanceChart);

  subjectChartData = computed(() => this.analyticsData()?.subjectChartData);
  financeChartData = computed(() => this.analyticsData()?.financeChartData);

  onYearChange(year: number, chartType: 'finance' | 'subjects') {
    if (chartType === 'finance') {
      this.queryParams.update((prev) => ({ ...prev, selectedYearForFinanceChart: year }));
    } else {
      this.queryParams.update((prev) => ({ ...prev, selectedYearForSubjectsChart: year }));
    }
  }
}
