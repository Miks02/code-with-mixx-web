import { PaymentType } from "./payment-type";

export type PaymentRequest = {
  reservationId: number,
  amount: number,
  transactionDate: string,
  note: string | null,
  paymentType: PaymentType,
}

export type PaymentFormModel = Omit<PaymentRequest, 'reservationId' | 'note'> & {
  note: string
};

export type RegisterPaymentFormModel = Omit<PaymentFormModel, 'paymentType'>;
