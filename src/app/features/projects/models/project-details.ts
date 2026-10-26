import { ProjectNoteDetails } from './project-reservation-details';
import { ProjectType } from './project-type';

export type ProjectDetails = {
  id: number;
  reservationId: number;
  subjectId: number;
  subjectName: string;
  projectType: ProjectType;
  price: number;
  progress: number;
  githubLink: string | null;
  downloadLink: string | null;
  reservedAt: string;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
  isReservationArchived: boolean;
  createdAt: string;
  updatedAt: string | null;
  notes: ProjectNoteDetails[];
};
