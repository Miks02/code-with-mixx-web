import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { StudentSelection } from '@features/students';
import { ReservationPricing, ReservationSummary } from '@features/reservations';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectReservationListForm } from '@features/projects/admin/components/project-reservation-list-form/project-reservation-list-form';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';

@Component({
  imports: [
    RouterLink,
    NgIcon,
    Button,
    StudentSelection,
    ProjectReservationListForm,
    ReservationPricing,
    ReservationSummary,
  ],
  providers: [
    ProjectFormService,
    AdminProjectReservationStore,
    provideIcons({ faSolidCalendarXmark }),
  ],
  selector: 'app-project-reservation-details-page',
  templateUrl: './project-reservation-details-page.html',
})
export class ProjectReservationDetailsPage {
  protected store = inject(AdminProjectReservationStore);
  protected formService = inject(ProjectFormService);
}
