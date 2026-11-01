import { FinanceChart } from "../components/finance-chart/finance-chart";
import { UpcomingClass } from "./upcoming-class-";
import { UpcomingProject } from "./upcoming-project";

export type AdminAnalytics = {
  totalRevenue: number;
  totalStudents: number;
  completedClasses: number;
  completedProjects: number;
  financeChartData: FinanceChart;
  upcomingClasses: UpcomingClass[];
  upcomingProjects: UpcomingProject[];
};