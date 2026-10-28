import { Signal, WritableSignal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { ReservationStatus } from '../models/reservation-status';
import { UpdateStatusFormModel } from '../models/update-status-request';

export function createUpdateStatusForm(
  request: WritableSignal<UpdateStatusFormModel>,
  currentStatus: Signal<ReservationStatus>,
) {
  return form(request, (schemaPath) => {
    required(schemaPath.reservationStatus, { message: 'Izaberi status rezervacije.' });
    validate(schemaPath.reservationStatus, ({ value }) => {
      if (value() === currentStatus()) {
        return {
          kind: 'sameStatus',
          message: 'Izabrani status je isti kao trenutni.',
        };
      }
      return null;
    });
  });
}
