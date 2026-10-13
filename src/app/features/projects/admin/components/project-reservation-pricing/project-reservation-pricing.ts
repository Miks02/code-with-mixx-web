import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ReservationStatus } from '../../../../reservations';
import { ProjectFormService } from '../../../services/project-form-service';

type ReservationStatusStyle = {
  label: string;
  dotClasses: string;
  selectedClasses: string;
};

const RESERVATION_STATUSES: Record<ReservationStatus, ReservationStatusStyle> = {
  [ReservationStatus.Confirmed]: {
    label: 'Potvrđena',
    dotClasses: 'bg-emerald-400',
    selectedClasses: 'bg-emerald-600 text-white',
  },
  [ReservationStatus.Completed]: {
    label: 'Završena',
    dotClasses: 'bg-sky-400',
    selectedClasses: 'bg-sky-700 text-white',
  },
  [ReservationStatus.Cancelled]: {
    label: 'Otkazana',
    dotClasses: 'bg-red-400',
    selectedClasses: 'bg-red-700 text-white',
  },
};

@Component({
  imports: [FormField],
  selector: 'app-project-reservation-pricing',
  styleUrl: './project-reservation-pricing.css',
  templateUrl: './project-reservation-pricing.html',
})
export class ProjectReservationPricing {
  projectFormService = inject(ProjectFormService);

  reservationForm = this.projectFormService.reservationForm;

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUSES;

  useProjectsSum = signal<boolean>(true);
  projectsSum = computed(() =>
    this.projectFormService
      .reservationModel()
      .projects.reduce((sum, project) => sum + project.price, 0),
  );

  constructor() {
    effect(() => {
      if (!this.useProjectsSum()) return;

      this.reservationForm.totalPrice().value.set(this.projectsSum());
    });
  }

  onStatusSelected(status: ReservationStatus) {
    this.reservationForm.reservationStatus().value.set(status);
  }

  onUseProjectsSumChanged(event: Event) {
    this.useProjectsSum.set((event.target as HTMLInputElement).checked);
  }

  onPaidShareSelected(share: number) {
    const totalPrice = Number(this.reservationForm.totalPrice().value()) || 0;
    this.reservationForm.paidAmount().value.set(Math.round(totalPrice * share));
  }
}
