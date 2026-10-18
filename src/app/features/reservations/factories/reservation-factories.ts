import { Signal, WritableSignal } from '@angular/core';
import { form, min, required, validate } from '@angular/forms/signals';
import { PaymentFormModel } from '../models/payment-request';
import { ReservationStatus } from '../models/reservation-status';
import { UpdateStatusFormModel } from '../models/update-status-request';

export function createRegisterPaymentForm(request: WritableSignal<PaymentFormModel>) {
  return form(request, (schemaPath) => {
    required(schemaPath.amount, { message: 'Unesite iznos uplate.' });
    min(schemaPath.amount, 1, { message: 'Iznos uplate mora biti najmanje 1 RSD.' });
  });
}

export function createSubtractPaymentForm(request: WritableSignal<PaymentFormModel>, paidAmount: Signal<number>) {
  return form(request, (schemaPath) => {
    required(schemaPath.amount, { message: 'Unesite iznos koji se skida.' });
    min(schemaPath.amount, 1, { message: 'Iznos mora biti najmanje 1 RSD.' });
    validate(schemaPath.amount, ({value}) => {
      if (value() > paidAmount()) {
        return {
          kind: "cantBeNegative",
          message: 'Nije moguće skinuti više od ukupno uplaćenog iznosa.'
        }
      }
      return null; 
    })
  });
}

export function createUpdateStatusForm(
  request: WritableSignal<UpdateStatusFormModel>,
  currentStatus: Signal<ReservationStatus>,
) {
  return form(request, (schemaPath) => {
    required(schemaPath.reservationStatus, { message: 'Izaberite status rezervacije.' });
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
