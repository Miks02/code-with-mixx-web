import { PagedResult } from '@core/models/paged-result';
import { ClassQueryParams } from '@features/classes/models/class-query-params';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassesSummary, NextClass } from '@features/classes/models/classes-summary';

export type StudentClassReservationItem = Omit<
  ClassReservationItem,
  'studentId' | 'studentFullName' | 'deletedAt' | 'isHardDeletable'
>;

export type StudentNextClass = Omit<NextClass, 'studentFullName' | 'university'>;

export type StudentClassesSummary = Omit<ClassesSummary, 'reservations' | 'nextClassItem'> & {
  nextClassItem: StudentNextClass | null;
  reservations: PagedResult<StudentClassReservationItem>;
};

export type StudentClassQueryParams = Omit<
  ClassQueryParams,
  'showOnlyDeletedReservations' | 'showOnlyDeletedStudents'
>;
