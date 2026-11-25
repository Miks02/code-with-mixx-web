import { ReservationType } from '@features/reservations';

export type RecentPayment = {
  transactionId: number;
  reservationId: number;
  reservationType: ReservationType;
  amount: number;
  transactionDate: string;
};
