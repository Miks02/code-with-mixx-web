import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type ClassReservationItem = {
  id: number;
  studentId: string;
  studentFullName: string;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  discountRate: number;
  bonus: number;
  createdAt: string;
  startsAt: string;
  endsAt: string;
  classes: ClassItem[];
};
