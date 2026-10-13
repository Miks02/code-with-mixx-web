import { ReservationStatus } from '../../reservations';
import { ProjectItem } from './project-item';

export type ProjectReservationRequest = {
  studentId: string,
  paidAmount: number,
  totalPrice: number,
  progress: number,
  reservationStatus: ReservationStatus,
  projects: ProjectItem[]
};

export type ProjectItemFormModel = Omit<ProjectItem, 'githubLink' | 'downloadLink'> & {
  githubLink: string,
  downloadLink: string
};

export type ProjectReservationFormModel = Omit<ProjectReservationRequest, 'projects'> & {
  projects: ProjectItemFormModel[];
};
