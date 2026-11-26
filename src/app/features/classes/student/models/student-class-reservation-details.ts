import { ClassReservationDetails } from '@features/classes/models/class-reservation-details';

export type StudentClassReservationDetails = Omit<
  ClassReservationDetails,
  'studentId' | 'studentFullName' | 'studentEmail' | 'studentUniversity'
> & {
  adminId: string;
  adminFullName: string;
  adminEmail: string;
};
