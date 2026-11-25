import { ReservationStatus } from '@features/reservations';

export type ClassReservationItem = {
  reservationId: number;
  scheduledClassesCount: number;
  completedClassesCount: number;
  reservationStatus: ReservationStatus;
  reservedAt: string;
};

export type ClassReservationsSummary = {
  total: number;
  totalHours: number;
  classReservationItems: ClassReservationItem[];
};
