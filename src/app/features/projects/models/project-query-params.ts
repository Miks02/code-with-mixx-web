import { ProjectType } from './project-type';
import { PaymentStatus, ReservationStatus } from '../../reservations';

export type ProjectQueryParams = {
  pageNumber: number;
  pageSize: number;
  subjectIds: number[];
  projectTypes: ProjectType[];
  reservationStatuses: ReservationStatus[];
  paymentStatuses: PaymentStatus[];
  showOnlyDeletedReservations: boolean;
  showOnlyDeletedStudents: boolean;
};
