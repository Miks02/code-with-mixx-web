import { ReservationStatus } from '@features/reservations';
import { ClassItem } from './class-item';

export type ClassItemRequest = Omit<ClassItem, 'id' | 'subjectName'>;

export type CreateClassReservationRequest = {
  studentId: string;
  totalPrice: number | null;
  reservationStatus: ReservationStatus;
  description: string | null;
  reservedAt: string;
  classes: ClassItemRequest[];
};

export type ClassItemFormModel = ClassItemRequest & { id: number };

export type ClassReservationFormModel = Omit<
  CreateClassReservationRequest,
  'description' | 'classes'
> & {
  description: string;
  classesToDelete: number[];
  classes: ClassItemFormModel[];
};
