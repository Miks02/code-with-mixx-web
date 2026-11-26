import { PagedResult } from '@core/models/paged-result';
import { ProjectQueryParams } from '@features/projects/models/project-query-params';
import { ProjectReservationItem } from '@features/projects/models/project-reservation-item';
import { ProjectsSummary } from '@features/projects/models/projects-summary';

export type StudentProjectReservationItem = Omit<
  ProjectReservationItem,
  'studentId' | 'studentFullName' | 'deletedAt' | 'isHardDeletable'
> & {
  updatedAt: string | null;
};

export type StudentProjectsSummary = Omit<ProjectsSummary, 'reservations'> & {
  reservations: PagedResult<StudentProjectReservationItem>;
};

export type StudentProjectQueryParams = Omit<
  ProjectQueryParams,
  'showOnlyDeletedReservations' | 'showOnlyDeletedStudents'
>;
