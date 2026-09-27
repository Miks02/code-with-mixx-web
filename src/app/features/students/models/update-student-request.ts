import { StudentItem } from './student-item';

export type UpdateStudentRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  university: string | null;
};

export type UpdateStudentFormModel = Omit<UpdateStudentRequest, 'university'> & {
  university: string;
};

export type UpdateStudentResponse = Omit<
  StudentItem,
  'totalClasses' | 'totalProjects' | 'totalReservations' | 'deletedAt'
>;
