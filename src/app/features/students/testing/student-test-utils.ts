import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { AccountStatus } from '@core/models/account-status';
import { PagedResult } from '@core/models/paged-result';
import { settle } from '@core/testing/test-utils';
import { StudentItem } from '@features/students/models/student-item';
import { StudentsSummary } from '@features/students/models/students-summary';

export const STUDENTS_URL = `${environment.apiUrl}/admin/students`;
export const STUDENTS_SUMMARY_URL = `${environment.apiUrl}/admin/students/summary`;
export const STUDENTS_LOOKUP_URL = `${environment.apiUrl}/admin/students/lookup`;

export function createStudent(overrides: Partial<StudentItem> = {}): StudentItem {
  return {
    id: 'student-1',
    firstName: 'Marko',
    lastName: 'Jovanović',
    email: 'marko.jovanovic@example.com',
    phoneNumber: '+381601234567',
    university: 'Elektrotehnički fakultet',
    totalReservations: 14,
    totalClasses: 12,
    totalProjects: 3,
    registeredAt: '2025-09-15T10:24:00Z',
    deletedAt: null,
    accountStatus: AccountStatus.Active,
    ...overrides,
  };
}

export function createPagedStudents(
  items: StudentItem[] = [createStudent()],
  overrides: Partial<PagedResult<StudentItem>> = {},
): PagedResult<StudentItem> {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 15,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    paginatedCount: items.length,
    ...overrides,
  };
}

export function createStudentsSummary(overrides: Partial<StudentsSummary> = {}): StudentsSummary {
  return {
    activeStudents: 1,
    pendingStudents: 0,
    deactivatedStudents: 0,
    deletedStudents: 0,
    mostActiveStudent: createStudent(),
    pagedStudents: createPagedStudents(),
    ...overrides,
  };
}

/**
 * Answers every pending summary request (the store fires one on creation and after mutations).
 * Also answers the lookup request, which StudentService fires as soon as it is created.
 */
export async function flushStudentsSummary(summary: StudentsSummary = createStudentsSummary()) {
  await settle();
  const http = TestBed.inject(HttpTestingController);
  http.match((req) => req.url === STUDENTS_LOOKUP_URL).forEach((req) => req.flush([]));
  http.match((req) => req.url === STUDENTS_SUMMARY_URL).forEach((req) => req.flush(summary));
  await settle();
}

export function expectStudentsRequest(params: Record<string, string | string[]>) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === STUDENTS_URL &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        Array.isArray(value)
          ? JSON.stringify(req.params.getAll(key) ?? []) === JSON.stringify(value)
          : req.params.get(key) === value,
      ),
  );
}
