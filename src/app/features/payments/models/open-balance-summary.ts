import { PaymentStatus, ReservationType } from '@features/reservations';

export type OpenBalanceItem = {
  reservationId: number;
  studentId: string | null;
  studentFullName: string | null;
  reservationType: ReservationType;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
};

export type OpenBalanceSummary = {
  remainingDebt: number;
  overdueReservationsCount: number;
  openBalanceItems: OpenBalanceItem[];
};
