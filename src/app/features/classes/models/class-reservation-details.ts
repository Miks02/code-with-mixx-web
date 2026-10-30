import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type ClassReservationDetails = {
  id: number;
  studentId: string;
  studentFullName: string;
  studentEmail: string;
  studentUniversity: string | null;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  discountRate: number;
  bonus: number;
  description: string | null;
  reservedAt: string;
  createdAt: string;
  updatedAt: string | null;
  classes: ClassItem[];
};
