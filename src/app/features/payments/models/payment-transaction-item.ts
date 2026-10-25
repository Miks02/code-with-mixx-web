import { PaymentType } from "./payment-type";

export type PaymentTransactionItem = {
  id: number,
  reservationId: number,
  amount: number,
  transactionDate: string,
  paymentType: PaymentType,
  note: string | null,
  createdAt: string,
}