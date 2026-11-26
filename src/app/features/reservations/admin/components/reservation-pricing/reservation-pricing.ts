import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Panel } from '@shared/components/panel/panel';
import { ReservationStatus } from '@features/reservations/models/reservation-status';
import { RESERVATION_STATUS_STYLES } from '@features/reservations/utilities/reservation-labels';

@Component({
  imports: [FormField, Panel],
  selector: 'app-reservation-pricing',
  templateUrl: './reservation-pricing.html',
})
export class ReservationPricing {
  reservationStatus = input.required<FieldTree<ReservationStatus>>();
  totalPrice = input.required<FieldTree<number | null>>();
  itemsTotal = input.required<number>();
  useItemsSum = input.required<boolean>();
  totalPaid = input<number>();
  sumLabel = input.required<string>();
  sumHint = input.required<string>();

  useItemsSumChanged = output<boolean>();

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUS_STYLES;

  onStatusSelected(status: ReservationStatus) {
    this.reservationStatus()().value.set(status);
  }

  onUseItemsSumChanged(event: Event) {
    this.useItemsSumChanged.emit((event.target as HTMLInputElement).checked);
  }
}
