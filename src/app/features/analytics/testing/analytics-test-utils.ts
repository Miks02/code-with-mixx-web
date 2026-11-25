import { StudentUpcomingClass } from '@features/analytics/student/models/student-upcoming-class';

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
