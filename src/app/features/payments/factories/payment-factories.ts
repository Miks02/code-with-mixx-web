import { Signal, WritableSignal } from '@angular/core';
import { form, min, minLength, required, validate } from '@angular/forms/signals';
import { PaymentFormModel, RegisterPaymentFormModel } from '../models/payment-request';
import { PaymentType } from '../models/payment-type';

export function createRegisterPaymentForm(request: WritableSignal<RegisterPaymentFormModel>) {
  return form(request, (schemaPath) => {
    required(schemaPath.amount, { message: 'Unesite iznos uplate.' });
    required(schemaPath.transactionDate, { message: 'Unesite datum transakcije.' });
    minLength(schemaPath.note, 20, { message: 'Beleške moraju imati najmanje 20 karaktera.' });
    min(schemaPath.amount, 1, { message: 'Iznos uplate mora biti najmanje 1 RSD.' });
  });
}

export function createSubtractPaymentForm(
  request: WritableSignal<PaymentFormModel>,
  paidAmount: Signal<number>,
) {
  return form(request, (schemaPath) => {
    required(schemaPath.amount, { message: 'Unesite iznos koji se skida.' });
    required(schemaPath.transactionDate, { message: 'Unesite datum transakcije.' });
    required(schemaPath.paymentType, { message: 'Izaberite vrstu transakcije.' });
    validate(schemaPath.paymentType, ({ value }) => {
      if (value() == PaymentType.payment) {
        return {
          kind: 'paymentTypeInvalid',
          message: 'Transakcija mora biti tipa \'Povraćaj novca\' ili \'Poništenje\'.',
        };
      }
      return null;
    });
    required(schemaPath.note, { message: 'Unesite beleške.' });
    minLength(schemaPath.note, 20, { message: 'Beleške moraju imati najmanje 20 karaktera.' });
    min(schemaPath.amount, 1, { message: 'Iznos mora biti najmanje 1 RSD.' });
    validate(schemaPath.amount, ({ value }) => {
      if (value() > paidAmount()) {
        return {
          kind: 'cantBeNegative',
          message: 'Nije moguće skinuti više od ukupno uplaćenog iznosa.',
        };
      }
      return null;
    });
  });
}
