import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft, faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { ReservationPayments } from '@features/payments';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { ProjectDetailsCard } from '@features/projects/components/project-details-card/project-details-card';
import { ProjectReservationOverview } from '@features/projects/components/project-reservation-overview/project-reservation-overview';
import { StudentProjectReservationDetailsStore } from '@features/projects/student/stores/student-project-reservation-details-store';

@Component({
  imports: [
    RouterLink,
    NgIcon,
    Button,
    Panel,
    Skeleton,
    ProjectDetailsCard,
    ProjectReservationOverview,
    ReservationPayments,
  ],
  providers: [
    StudentProjectReservationDetailsStore,
    provideIcons({ faSolidArrowLeft, faSolidCalendarXmark }),
  ],
  selector: 'app-student-project-reservation-details-page',
  templateUrl: './student-project-reservation-details-page.html',
})
export class StudentProjectReservationDetailsPage {
  protected store = inject(StudentProjectReservationDetailsStore);

  protected skeletonCards = [0, 1];
}
