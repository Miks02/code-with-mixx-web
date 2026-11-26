import { ClassReservationsSummary } from './class-reservations-summary';
import { OpenBalanceSummary } from './open-balance-summary';
import { RecentPayment } from './recent-payment';
import { StudentUpcomingClass } from './student-upcoming-class';
import { StudentUpcomingProject } from './student-upcoming-project';

export type StudentAnalytics = {
  totalPaid: number;
  completedClasses: number;
  activeProjects: number;
  heldSubjects: number;
  upcomingClasses: StudentUpcomingClass[];
  activeProjectsList: StudentUpcomingProject[];
  classReservationsSummary: ClassReservationsSummary;
  openBalanceSummary: OpenBalanceSummary;
  recentPayments: RecentPayment[];
};
