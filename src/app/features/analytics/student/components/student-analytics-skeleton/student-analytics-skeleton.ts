import { Component } from '@angular/core';
import { Skeleton } from '@shared/components/skeleton/skeleton';

@Component({
  imports: [Skeleton],
  selector: 'app-student-analytics-skeleton',
  templateUrl: './student-analytics-skeleton.html',
})
export class StudentAnalyticsSkeleton {
  readonly actionButtons = [1, 2, 3];
  readonly analyticsCards = [1, 2, 3, 4];
  readonly upcomingRows = [1, 2];
  readonly reservationCards = [1, 2];
  readonly projectCards = [1, 2];
  readonly balanceCards = [1, 2];
  readonly paymentRows = [1, 2, 3];
}
