import { Component, computed, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RESERVATION_STATUS_STYLES, ReservationStatus } from '@features/reservations';
import { ProjectFormService } from '@features/projects/services/project-form-service';

@Component({
  imports: [FormField],
  selector: 'app-project-reservation-pricing',
  styleUrl: './project-reservation-pricing.css',
  templateUrl: './project-reservation-pricing.html',
})
export class ProjectReservationPricing {
  private projectFormService = inject(ProjectFormService);

  reservationForm = this.projectFormService.reservationForm;

  totalPaid = input<number>();

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUS_STYLES;

  private projects = computed(() => this.projectFormService.reservationModel().projects);

  private totalBasedOnProjectsPrice = computed(() => {
    return this.projects()
      .map((p) => p.price)
      .reduce((p, curr) => p + curr);
  });

  useProjectsSum = signal<boolean>(false);
  projectsSum = computed(() => {
    if (this.useProjectsSum()) return this.totalBasedOnProjectsPrice();

    return this.reservationForm.totalPrice().value();
  });

  onStatusSelected(status: ReservationStatus) {
    this.reservationForm.reservationStatus().value.set(status);
  }

  onUseProjectsSumChanged(event: Event) {
    this.useProjectsSum.set((event.target as HTMLInputElement).checked);
  }
}
