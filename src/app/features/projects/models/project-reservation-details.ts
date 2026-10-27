import { PaymentStatus, ReservationStatus } from '../../reservations';
import { ProjectType } from './project-type';

export type ProjectNoteDetails = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
};

export type ProjectDetailsItem = {
  id: number;
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
  createdAt: string;
  updatedAt: string | null;
  notes: ProjectNoteDetails[];
  notesToDelete: number[];
};

export type ProjectReservationDetails = {
  id: number;
  studentId: string;
  studentFullName: string;
  studentEmail: string;
  description: string | null;
  studentUniversity: string | null;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  discountRate: number;
  reservedAt: string;
  bonus: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  isHardDeletable: boolean;
  projects: ProjectDetailsItem[];
};
