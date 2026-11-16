import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { StudentSelection } from '@features/students';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectReservationListForm } from '@features/projects/admin/components/project-reservation-list-form/project-reservation-list-form';
import { ProjectReservationPricing } from '@features/projects/admin/components/project-reservation-pricing/project-reservation-pricing';
import { ProjectReservationSummary } from '@features/projects/admin/components/project-reservation-summary/project-reservation-summary';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';

@Component({
  imports: [
    RouterLink,
    Button,
    StudentSelection,
    ProjectReservationListForm,
    ProjectReservationPricing,
    ProjectReservationSummary,
  ],
  providers: [ProjectFormService, AdminProjectReservationStore],
  selector: 'app-create-project-reservation-page',
  styleUrl: './create-project-reservation-page.css',
  templateUrl: './create-project-reservation-page.html',
})
export class CreateProjectReservationPage {
  protected store = inject(AdminProjectReservationStore);
}
