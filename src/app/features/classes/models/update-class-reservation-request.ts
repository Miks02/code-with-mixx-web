import { ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type UpdateClassReservationRequest = {
  id: number;
  studentId: string;
  paidAmount: number;
  totalPrice: number;
  reservationStatus: ReservationStatus;
  description: string | null;
  classesToDelete: number[];
  classes: ClassItem[];
};
