import { ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type UpdateClassItemRequest = Omit<ClassItem, 'subjectName'>;

export type UpdateClassReservationRequest = {
  id: number;
  studentId: string;
  totalPrice: number | null;
  reservationStatus: ReservationStatus;
  description: string | null;
  classesToDelete: number[];
  classes: UpdateClassItemRequest[];
};
