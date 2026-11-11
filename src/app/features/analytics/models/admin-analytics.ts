import { FinanceChart } from '../components/finance-chart/finance-chart';
import { SubjectChart } from './subject-chart';
import { UpcomingClass } from './upcoming-class-';
import { UpcomingProject } from './upcoming-project';

export type AdminAnalytics = {
  totalRevenue: number;
  totalStudents: number;
  completedClasses: number;
  completedProjects: number;
  availableYearsForSubjectsChart: number[];
  availableYearsForFinanceChart: number[];
  financeChartData: FinanceChart;
  subjectChartData: SubjectChart[];
  upcomingClasses: UpcomingClass[];
  upcomingProjects: UpcomingProject[];
};
