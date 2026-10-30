import { PagedResult } from '@core/models/paged-result';
import { ClassReservationItem } from './class-reservation-item';

export type NextClass = {
  reservationId: number;
  studentFullName: string;
  startsAt: string;
  university: string | null;
  subjectName: string;
};

export type ClassesSummary = {
  totalClassesCount: number;
  heldClassesCount: number;
  scheduledClassesCount: number;
  cancelledClassesCount: number;
  nextClassItem: NextClass | null;
  reservations: PagedResult<ClassReservationItem>;
};
