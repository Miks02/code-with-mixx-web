import { ProjectType } from './project-type';
import { ReservationStatus } from '../../reservations';

export type ProjectQueryParams = {
  pageNumber: number;
  pageSize: number;
  projectTypes: ProjectType[];
  reservationStatuses: ReservationStatus[];
  showOnlyDeletedStudents: boolean;
};
