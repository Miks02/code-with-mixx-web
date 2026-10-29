import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassReservationSortBy } from './class-reservation-sort-by';

export type ClassQueryParams = {
  pageNumber: number;
  pageSize: number;
  subjectIds: number[];
  reservationStatuses: ReservationStatus[];
  paymentStatuses: PaymentStatus[];
  sortBy: ClassReservationSortBy;
  showOnlyDeletedReservations: boolean;
  showOnlyDeletedStudents: boolean;
};
