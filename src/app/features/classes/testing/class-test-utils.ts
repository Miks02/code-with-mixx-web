import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '@environments/environment';
import { PagedResult } from '@core/models/paged-result';
import { settle } from '@core/testing/test-utils';
import { dateInputValue, dateTimeInputValue } from '@core/utilities/date-helpers';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { AdminClassReservationStore } from '@features/classes/admin/stores/admin-class-reservation-store';
import { createEmptyClassReservation } from '@features/classes/factories/class-factories';
import { ClassItem } from '@features/classes/models/class-item';
import { ClassReservationDetails } from '@features/classes/models/class-reservation-details';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassesSummary } from '@features/classes/models/classes-summary';
import {
  ClassItemFormModel,
  ClassReservationFormModel,
} from '@features/classes/models/create-class-reservation-request';
import { ClassFormService } from '@features/classes/services/class-form-service';

export const CLASS_RESERVATIONS_URL = `${environment.apiUrl}/admin/reservations/classes`;
export const CLASSES_SUMMARY_URL = `${CLASS_RESERVATIONS_URL}/summary`;
export const SUBJECTS_LOOKUP_URL = `${environment.apiUrl}/subjects/lookup`;
export const STUDENTS_LOOKUP_URL = `${environment.apiUrl}/admin/students/lookup`;
export const RESERVATIONS_URL = `${environment.apiUrl}/admin/reservations`;
export const paymentHistoryUrl = (reservationId: number) =>
  `${environment.apiUrl}/reservations/${reservationId}/payments`;

export const SUBJECTS_LOOKUP = [
  { id: 1, subjectName: 'Baze podataka' },
  { id: 2, subjectName: 'Web programiranje' },
];

export const STUDENTS_LOOKUP = [
  { id: 'student-1', fullName: 'Marko Jovanović', email: 'marko.jovanovic@example.com' },
  { id: 'student-2', fullName: 'Jelena Petrović', email: 'jelena.petrovic@example.com' },
];

export function createClassItem(overrides: Partial<ClassItem> = {}): ClassItem {
  return {
    id: 10,
    subjectId: 1,
    subjectName: 'Baze podataka',
    price: 1300,
    startsAt: '2026-10-05T10:00:00Z',
    endsAt: '2026-10-05T10:45:00Z',
    reservedAt: '2026-10-01',
    ...overrides,
  };
}

export function createClassReservation(
  overrides: Partial<ClassReservationItem> = {},
): ClassReservationItem {
  return {
    id: 1,
    studentId: 'student-1',
    studentFullName: 'Marko Jovanović',
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.PartiallyPaid,
    totalPrice: 2600,
    paidAmount: 1300,
    discountRate: 0,
    bonus: 0,
    description: null,
    createdAt: '2026-10-01T10:00:00Z',
    deletedAt: null,
    isHardDeletable: false,
    startsAt: '2026-10-05T10:00:00Z',
    endsAt: '2026-10-05T11:30:00Z',
    classes: [createClassItem()],
    ...overrides,
  };
}

export function createPagedClassReservations(
  items: ClassReservationItem[] = [createClassReservation()],
  overrides: Partial<PagedResult<ClassReservationItem>> = {},
): PagedResult<ClassReservationItem> {
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

export function createClassesSummary(overrides: Partial<ClassesSummary> = {}): ClassesSummary {
  return {
    totalClassesCount: 1,
    heldClassesCount: 0,
    scheduledClassesCount: 1,
    cancelledClassesCount: 0,
    nextClassItem: null,
    reservations: createPagedClassReservations(),
    ...overrides,
  };
}

export function createClassReservationDetails(
  overrides: Partial<ClassReservationDetails> = {},
): ClassReservationDetails {
  return {
    id: 7,
    studentId: 'student-2',
    studentFullName: 'Jelena Petrović',
    studentEmail: 'jelena.petrovic@example.com',
    studentUniversity: null,
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.PartiallyPaid,
    totalPrice: 2600,
    paidAmount: 1300,
    discountRate: 0,
    bonus: 0,
    description: 'Priprema za kolokvijum',
    reservedAt: '2026-10-01',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: null,
    classes: [
      createClassItem({
        id: 21,
        startsAt: '2026-10-05T10:00:00Z',
        endsAt: '2026-10-05T10:45:00Z',
      }),
      createClassItem({
        id: 22,
        subjectId: 2,
        subjectName: 'Web programiranje',
        startsAt: '2026-10-05T10:45:00Z',
        endsAt: '2026-10-05T11:30:00Z',
      }),
    ],
    ...overrides,
  };
}

export function provideReservationRoute(reservationId: string | null) {
  return [
    provideRouter([
      { path: 'admin/classes', children: [] },
      { path: 'admin/classes/details/:id', children: [] },
    ]),
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: { paramMap: convertToParamMap(reservationId ? { id: reservationId } : {}) },
      },
    },
  ];
}

export async function flushLookups() {
  await settle();
  const http = TestBed.inject(HttpTestingController);
  http.match(SUBJECTS_LOOKUP_URL).forEach((req) => req.flush(SUBJECTS_LOOKUP));
  http.match(STUDENTS_LOOKUP_URL).forEach((req) => req.flush(STUDENTS_LOOKUP));
  await settle();
}

export async function flushClassesSummary(summary: ClassesSummary = createClassesSummary()) {
  await flushLookups();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === CLASSES_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

export function expectClassReservationsRequest(params: Record<string, string | string[]>) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === CLASS_RESERVATIONS_URL &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        Array.isArray(value)
          ? JSON.stringify(req.params.getAll(key) ?? []) === JSON.stringify(value)
          : req.params.get(key) === value,
      ),
  );
}

export function provideReservationFormTesting(reservationId: string | null) {
  return [ClassFormService, AdminClassReservationStore, provideReservationRoute(reservationId)];
}

export function expectReservationDetailsRequest(reservationId = 7) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) => req.url === `${CLASS_RESERVATIONS_URL}/${reservationId}` && req.method === 'GET',
  );
}

export function flushReservationDetailsRefetch(
  details: ClassReservationDetails = createClassReservationDetails(),
) {
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === `${CLASS_RESERVATIONS_URL}/${details.id}` && req.method === 'GET')
    .forEach((req) => req.flush(details));
}

export function createFormClass(
  startsAt: Date,
  overrides: Partial<ClassItemFormModel> = {},
): ClassItemFormModel {
  return {
    id: 0,
    subjectId: 1,
    price: 1300,
    startsAt: dateTimeInputValue(startsAt),
    endsAt: dateTimeInputValue(new Date(startsAt.getTime() + 45 * 60 * 1000)),
    reservedAt: dateInputValue(-10),
    ...overrides,
  };
}

export function inDays(days: number, hours = 10, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function createValidReservationModel(
  overrides: Partial<ClassReservationFormModel> = {},
): ClassReservationFormModel {
  return {
    ...createEmptyClassReservation(),
    studentId: 'student-1',
    reservedAt: dateInputValue(-10),
    classes: [createFormClass(inDays(3))],
    ...overrides,
  };
}
