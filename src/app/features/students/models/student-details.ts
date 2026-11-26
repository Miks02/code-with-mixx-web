import { AccountStatus } from '@core/models/account-status';
import { PagedResult } from '@core/models/paged-result';
import { PaymentStatus, ReservationStatus, ReservationType } from '@features/reservations';
import { ProjectType } from '@features/projects';

export type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  university: string | null;
  accountStatus: AccountStatus;
  registeredAt: string;
  lastLoginAt: string | null;
  deletedAt: string | null;
};

export type StudentReservationsStats = {
  totalReservations: number;
  classReservations: number;
  projectReservations: number;
  totalClasses: number;
  totalProjects: number;
  overdueReservations: number;
  totalPrice: number;
  totalPaid: number;
  totalRemaining: number;
};

export type StudentReservationClass = {
  id: number;
  name: string;
  subjectId: number;
  subjectName: string;
  price: number;
  startsAt: string;
  endsAt: string;
  reservedAt: string;
};

export type StudentReservationProject = {
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
  notesCount: number;
};

export type StudentReservation = {
  id: number;
  reservationType: ReservationType;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  discountRate: number;
  bonus: number;
  description: string | null;
  reservedAt: string;
  createdAt: string;
  classes: StudentReservationClass[];
  projects: StudentReservationProject[];
};

export type StudentDetailsResponse = {
  student: StudentProfile;
  stats: StudentReservationsStats;
  reservations: PagedResult<StudentReservation>;
};

export type ReservationTypeFilter = ReservationType | 'All';

export type StudentDetailsQueryParams = {
  pageNumber: number;
  pageSize: number;
  reservationType: ReservationType | null;
};
