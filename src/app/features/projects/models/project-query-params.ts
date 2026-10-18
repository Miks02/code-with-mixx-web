import { ProjectType } from './project-type';
import { ReservationStatus } from '../../reservations';

export type ProjectQueryParams = {
  pageNumber: number;
  pageSize: number;
  subjectIds: number[];
  projectTypes: ProjectType[];
  reservationStatuses: ReservationStatus[];
  showOnlyDeletedReservations: boolean;
  showOnlyDeletedStudents: boolean;
};
