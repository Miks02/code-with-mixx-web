import { PaymentStatus, ReservationStatus } from '../../reservations';
import { ProjectItem } from './project-item';

export type ProjectReservationItem = {
  id: number;
  studentId: string;
  studentFullName: string;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  discountRate: number;
  bonus: number;
  createdAt: string;
  deletedAt: string | null;
  isHardDeletable: boolean;
  projects: ProjectItem[];
};
