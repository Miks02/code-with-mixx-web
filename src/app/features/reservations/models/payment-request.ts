import { PaymentType } from "../../payments";

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
