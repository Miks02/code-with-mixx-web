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
    selectedYearForFinanceChart: 2026,
    selectedYearForSubjectsChart: 2026
  })
  private analyticsService = inject(AnalyticsService);

  analyticsQuery = this.analyticsService.getAdminAnalyticsQuery(this.queryParams);
  analyticsData = computed(() => this.analyticsQuery.data());

  completedClasses = computed(() => this.analyticsData()?.completedClasses)
  completedProjects = computed(() => this.analyticsData()?.completedProjects)
  totalRevenue = computed(() => priceConverter(this.analyticsData()?.totalRevenue ?? 0))
  totalStudents = computed(() => this.analyticsData()?.totalStudents)
  upcomingClasses = computed(() => this.analyticsData()?.upcomingClasses)
  upcomingProjects = computed(() => this.analyticsData()?.upcomingProjects)

  onYearChange(year: number, chartType: 'finance' | 'subjects') {
    if (chartType === 'finance') {
      this.queryParams.update((prev) => ({...prev, selectedYearForFinanceChart: year}));
    } else {
      this.queryParams.update((prev) => ({...prev, selectedYearForSubjectsChart: year}))
    }
  }
}
