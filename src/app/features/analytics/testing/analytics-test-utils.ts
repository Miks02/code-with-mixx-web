import {
  ClassReservationItem,
  ClassReservationsSummary,
} from '@features/analytics/student/models/class-reservations-summary';
import { StudentUpcomingClass } from '@features/analytics/student/models/student-upcoming-class';
import { ReservationStatus } from '@features/reservations';

export function createStudentUpcomingClass(
  overrides: Partial<StudentUpcomingClass> = {},
): StudentUpcomingClass {
  return {
    reservationId: 1,
    subjectName: 'Osnove programiranja',
    startsAt: '2026-11-26T10:00:00Z',
    endsAt: '2026-11-26T11:00:00Z',
    ...overrides,
  };
}

export function createClassReservationItem(
  overrides: Partial<ClassReservationItem> = {},
): ClassReservationItem {
  return {
    reservationId: 1,
    scheduledClassesCount: 10,
    completedClassesCount: 4,
    reservationStatus: ReservationStatus.Confirmed,
    reservedAt: '2026-11-12',
    ...overrides,
  };
}

export function createClassReservationsSummary(
  overrides: Partial<ClassReservationsSummary> = {},
): ClassReservationsSummary {
  return {
    total: 1,
    totalHours: 10,
    classReservationItems: [createClassReservationItem()],
    ...overrides,
  };
}
