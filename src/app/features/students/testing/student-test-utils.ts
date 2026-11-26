import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '@environments/environment';
import { AccountStatus } from '@core/models/account-status';
import { PagedResult } from '@core/models/paged-result';
import { settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus, ReservationType } from '@features/reservations';
import {
  StudentDetailsResponse,
  StudentProfile,
  StudentReservation,
  StudentReservationsStats,
} from '@features/students/models/student-details';
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

export function createStudentProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: 'student-1',
    firstName: 'Marko',
    lastName: 'Jovanović',
    email: 'marko.jovanovic@example.com',
    phoneNumber: '+381601234567',
    university: 'Elektrotehnički fakultet',
    accountStatus: AccountStatus.Active,
    registeredAt: '2025-09-15T10:24:00Z',
    lastLoginAt: '2026-11-10T12:30:00Z',
    deletedAt: null,
    ...overrides,
  };
}

export function createStudentStats(
  overrides: Partial<StudentReservationsStats> = {},
): StudentReservationsStats {
  return {
    totalReservations: 4,
    classReservations: 3,
    projectReservations: 1,
    totalClasses: 9,
    totalProjects: 1,
    overdueReservations: 1,
    totalPrice: 15600,
    totalPaid: 9100,
    totalRemaining: 6500,
    ...overrides,
  };
}

export function createStudentReservation(
  overrides: Partial<StudentReservation> = {},
): StudentReservation {
  return {
    id: 1,
    reservationType: ReservationType.Class,
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.Paid,
    totalPrice: 1300,
    paidAmount: 1300,
    discountRate: 0,
    bonus: 0,
    description: null,
    reservedAt: '2026-10-18',
    createdAt: '2026-10-18T09:00:00Z',
    classes: [
      {
        id: 1,
        subjectId: 1,
        subjectName: 'Baze podataka',
        price: 1300,
        startsAt: '2026-11-03T10:00:00',
        endsAt: '2026-11-03T10:45:00',
        reservedAt: '2026-10-18',
      },
    ],
    projects: [],
    ...overrides,
  };
}

export function createPagedReservations(
  items: StudentReservation[] = [createStudentReservation()],
  overrides: Partial<PagedResult<StudentReservation>> = {},
): PagedResult<StudentReservation> {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    paginatedCount: items.length,
    ...overrides,
  };
}

export function createStudentDetails(
  overrides: Partial<StudentDetailsResponse> = {},
): StudentDetailsResponse {
  return {
    student: createStudentProfile(),
    stats: createStudentStats(),
    reservations: createPagedReservations(),
    ...overrides,
  };
}

export function provideStudentRoute(studentId = 'student-1') {
  const paramMap = convertToParamMap({ id: studentId });
  return [
    provideRouter([{ path: 'admin/students', children: [] }]),
    { provide: ActivatedRoute, useValue: { snapshot: { paramMap }, paramMap: of(paramMap) } },
  ];
}

/** StudentService fires the lookup request as soon as it is created; this answers it. */
export async function flushStudentsLookup() {
  await settle();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === STUDENTS_LOOKUP_URL)
    .forEach((req) => req.flush([]));
}

/**
 * Expects one details request for the student. A `null` param value means the param must be absent.
 */
export function expectStudentDetailsRequest(
  params: Record<string, string | null> = {},
  studentId = 'student-1',
) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === `${STUDENTS_URL}/${studentId}` &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        value === null ? !req.params.has(key) : req.params.get(key) === value,
      ),
  );
}

export async function flushStudentDetails(
  details: StudentDetailsResponse = createStudentDetails(),
  studentId = 'student-1',
) {
  await flushStudentsLookup();
  expectStudentDetailsRequest({}, studentId).flush(details);
  await settle();
}
