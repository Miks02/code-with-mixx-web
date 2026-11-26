import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { StudentSelection } from '@features/students';
import { ReservationPricing, ReservationSummary } from '@features/reservations';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectReservationListForm } from '@features/projects/admin/components/project-reservation-list-form/project-reservation-list-form';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';

@Component({
  imports: [
    RouterLink,
    Button,
    StudentSelection,
    ProjectReservationListForm,
    ReservationPricing,
    ReservationSummary,
  ],
  providers: [ProjectFormService, AdminProjectReservationStore],
  selector: 'app-create-project-reservation-page',
  styleUrl: './create-project-reservation-page.css',
  templateUrl: './create-project-reservation-page.html',
})
export class CreateProjectReservationPage {
  protected store = inject(AdminProjectReservationStore);
  protected formService = inject(ProjectFormService);
}
