import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  'Reservation.NotFound': 'Rezervacija više ne postoji. Osveži stranicu.',
  'Reservation.InvalidAmount':
    'Iznos nije ispravan. Mora biti veći od 0 i ne može biti veći od uplaćenog iznosa.',
  'PaymentTransaction.CannotBeInTheFuture': 'Datum uplate ne može biti u budućnosti.',
  'PaymentTransaction.InvalidPaymentType': 'Izabrani tip transakcije nije dozvoljen.',
  'TransactionNote.RequiredForReversal': 'Napomena je obavezna za storniranje uplate.',
  'TransactionNote.RequiredForRefund': 'Napomena je obavezna za povraćaj novca.',
};

export function getPaymentErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors) return 'Podaci uplate nisu ispravni. Proveri polja forme.';

  return PAYMENT_ERROR_MESSAGES[err.errorCode];
}
