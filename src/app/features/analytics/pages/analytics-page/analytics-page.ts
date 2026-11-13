import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { priceConverter } from '@core/utilities/price-helpers';
import { AdminActionBar } from '@features/analytics/components/admin-action-bar/admin-action-bar';
import { AnalyticsCard } from '@features/analytics/components/analytics-card/analytics-card';
import { FinanceChart } from '@features/analytics/components/finance-chart/finance-chart';
import { SubjectsChart } from '@features/analytics/components/subjects-chart/subjects-chart';
import { UpcomingClasses } from '@features/analytics/components/upcoming-classes/upcoming-classes';
import { UpcomingProjects } from '@features/analytics/components/upcoming-projects/upcoming-projects';
import { AdminQueryParams } from '@features/analytics/models/admin-query-params';
import { AnalyticsService } from '@features/analytics/services/analytics-service';
import { provideIcons } from '@ng-icons/core';
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
  private queryParams: WritableSignal<AdminQueryParams> = signal({
    selectedYearForFinanceChart: new Date().getFullYear(),
    selectedYearForSubjectsChart: new Date().getFullYear(),
  });
  private analyticsService = inject(AnalyticsService);

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
