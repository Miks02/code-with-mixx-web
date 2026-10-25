import { ReservationStatus } from '../../reservations';
import { ProjectItem } from './project-item';

export type ProjectReservationRequest = {
  id: number,
  studentId: string,
  paidAmount: number,
  totalPrice: number,
  reservationStatus: ReservationStatus,
  reservedAt: string,
  projects: ProjectItem[]
};

export type ProjectItemFormModel = Omit<ProjectItem, 'githubLink' | 'downloadLink'> & {
  githubLink: string,
  downloadLink: string,
  notesToDelete: number[]
};

export type ProjectReservationFormModel = Omit<ProjectReservationRequest, 'projects'> & {
  projectsToDelete: number[],
  projects: ProjectItemFormModel[]
};
