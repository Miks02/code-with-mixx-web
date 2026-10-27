import { PagedResult } from '../../../core/models/paged-result';
import { ProjectReservationItem } from './project-reservation-item';

export type ProjectsSummary = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  reservations: PagedResult<ProjectReservationItem>;
};
