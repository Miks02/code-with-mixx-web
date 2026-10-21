import { PaymentTransactionItem } from "../../payments";

export type ReservationPaymentHistory = {
  reservationId: number,
  remainingAmount: number,
  bonusAmount: number,
  paidSum: number,
  totalSum: number,
  reversedSum: number,
  payments: PaymentTransactionItem[],
}