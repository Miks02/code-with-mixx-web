import { PaymentTransactionsSortBy } from '../models/payment-transactions-sort-by';
import { PaymentType } from '../models/payment-type';

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.payment]: 'Uplata',
  [PaymentType.reversal]: 'Poništena uplata',
  [PaymentType.refund]: 'Povraćaj novca',
};

export const PAYMENT_SORT_LABELS: Record<PaymentTransactionsSortBy, string> = {
  [PaymentTransactionsSortBy.TransactionDateDescending]: 'Najnovije',
  [PaymentTransactionsSortBy.TransactionDateAscending]: 'Najstarije',
  [PaymentTransactionsSortBy.ReservationIdDescending]: 'Rezervacija opadajuće',
  [PaymentTransactionsSortBy.ReservationIdAscending]: 'Rezervacija rastuće',
};
