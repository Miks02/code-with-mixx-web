import { ReservationStatus } from '../../reservations';
import { ProjectItem } from './project-item';

export type ProjectReservationRequest = {
  id: number,
  studentId: string,
  totalPrice: number,
  reservationStatus: ReservationStatus,
  reservedAt: string,
  description: string | null,
  projects: ProjectItem[]
};

export type ProjectItemFormModel = Omit<ProjectItem, 'githubLink' | 'downloadLink'> & {
  githubLink: string,
  downloadLink: string,
  notesToDelete: number[]
};

export type ProjectReservationFormModel = Omit<ProjectReservationRequest, 'projects' | 'description'> & {
  description: string,
  projectsToDelete: number[],
  projects: ProjectItemFormModel[]
};
