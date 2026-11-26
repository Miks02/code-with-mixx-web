import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarXmark, faSolidPenToSquare } from '@ng-icons/font-awesome/solid';
import { ReservationPayments } from '@features/payments';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { ProjectDetailsCard } from '@features/projects/admin/components/project-details-card/project-details-card';
import { ProjectReservationOverview } from '@features/projects/admin/components/project-reservation-overview/project-reservation-overview';
import { AdminProjectReservationDetailsStore } from '@features/projects/admin/stores/admin-project-reservation-details-store';

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
    AdminProjectReservationDetailsStore,
    provideIcons({ faSolidCalendarXmark, faSolidPenToSquare }),
  ],
  selector: 'app-project-reservation-details-page',
  templateUrl: './project-reservation-details-page.html',
})
export class ProjectReservationDetailsPage {
  protected store = inject(AdminProjectReservationDetailsStore);

  protected skeletonCards = [0, 1];
}
