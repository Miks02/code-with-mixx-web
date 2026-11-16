import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RESERVATION_STATUS_STYLES, ReservationStatus } from '@features/reservations';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';
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

  protected totalPaid = inject(AdminProjectReservationStore).totalPaid;

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUS_STYLES;

  private projects = computed(() => this.projectFormService.reservationModel().projects);

  private totalBasedOnProjectsPrice = computed(() => {
    return this.projects().reduce((sum, project) => sum + project.price, 0);
  });

  useProjectsSum = signal<boolean>(false);
  projectsSum = computed(() => {
    if (this.useProjectsSum()) return this.totalBasedOnProjectsPrice();

    return this.reservationForm.totalPrice().value();
  });

  constructor() {
    effect(() => {
      if (!this.useProjectsSum()) return;

      const sum = this.totalBasedOnProjectsPrice();
      untracked(() => this.reservationForm.totalPrice().value.set(sum));
    });
  }

  onStatusSelected(status: ReservationStatus) {
    this.reservationForm.reservationStatus().value.set(status);
  }

  onUseProjectsSumChanged(event: Event) {
    this.useProjectsSum.set((event.target as HTMLInputElement).checked);
  }
}
