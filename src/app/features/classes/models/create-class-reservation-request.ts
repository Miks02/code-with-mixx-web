import { ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type CreateClassItem = Omit<ClassItem, 'id' | 'subjectName'>;

export type CreateClassReservationRequest = {
  studentId: string;
  paidAmount: number;
  totalPrice: number | null;
  reservationStatus: ReservationStatus;
  description: string | null;
  classes: CreateClassItem[];
};
