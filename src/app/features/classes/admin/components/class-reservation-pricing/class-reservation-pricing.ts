import { Component, computed, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RESERVATION_STATUS_STYLES, ReservationStatus } from '@features/reservations';
import { AdminClassReservationStore } from '@features/classes/admin/stores/admin-class-reservation-store';
import { ClassFormService } from '@features/classes/services/class-form-service';

@Component({
  imports: [FormField],
  selector: 'app-class-reservation-pricing',
  styleUrl: './class-reservation-pricing.css',
  templateUrl: './class-reservation-pricing.html',
})
export class ClassReservationPricing {
  private classFormService = inject(ClassFormService);

  reservationForm = this.classFormService.reservationForm;

  protected totalPaid = inject(AdminClassReservationStore).totalPaid;

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUS_STYLES;

  classesSum = computed(() =>
    this.classFormService.reservationModel().classes.reduce((sum, c) => sum + (c.price || 0), 0),
  );

  // A null total price makes the backend sum class prices on its own
  useClassesSum = computed(() => this.reservationForm.totalPrice().value() === null);

  onStatusSelected(status: ReservationStatus) {
    this.reservationForm.reservationStatus().value.set(status);
  }

  onUseClassesSumChanged(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.reservationForm.totalPrice().value.set(checked ? null : this.classesSum());
  }
}
