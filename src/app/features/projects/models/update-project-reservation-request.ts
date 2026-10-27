import { ReservationStatus } from '@features/reservations';
import { ProjectItem } from './project-item';

export type UpdateProjectReservationRequest = {
  id: number;
  studentId: string;
  totalPrice: number;
  reservationStatus: ReservationStatus;
  reservedAt: string;
  description: string | null;
  projectsToDelete: number[];
  projects: UpdateProjectItem[];
};

export type UpdateProjectItem = ProjectItem & {
  notesToDelete: number[];
};
