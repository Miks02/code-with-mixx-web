import {
  ProjectDetailsItem,
  ProjectReservationDetails,
} from '@features/projects/models/project-reservation-details';

export type StudentProjectReservationDetails = Omit<
  ProjectReservationDetails,
  | 'studentId'
  | 'studentFullName'
  | 'studentEmail'
  | 'studentUniversity'
  | 'notes'
  | 'deletedAt'
  | 'isHardDeletable'
  | 'projects'
> & {
  adminId: string;
  adminFullName: string;
  adminEmail: string;
  projects: Omit<ProjectDetailsItem, 'notesToDelete'>[];
};
