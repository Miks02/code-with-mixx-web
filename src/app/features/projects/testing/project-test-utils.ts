import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '@environments/environment';
import { PagedResult } from '@core/models/paged-result';
import { settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';
import {
  createEmptyProject,
  createEmptyReservation,
} from '@features/projects/factories/project-factories';
import { ProjectDetails } from '@features/projects/models/project-details';
import { ProjectReservationDetails } from '@features/projects/models/project-reservation-details';
import {
  ProjectListItem,
  ProjectReservationItem,
} from '@features/projects/models/project-reservation-item';
import { ProjectReservationFormModel } from '@features/projects/models/project-reservation-request';
import { ProjectType } from '@features/projects/models/project-type';
import { ProjectsSummary } from '@features/projects/models/projects-summary';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { StudentProjectReservationDetails } from '@features/projects/student/models/student-project-reservation-details';
import {
  StudentProjectReservationItem,
  StudentProjectsSummary,
} from '@features/projects/student/models/student-project-reservation-item';

export const PROJECT_RESERVATIONS_URL = `${environment.apiUrl}/admin/reservations/projects`;
export const PROJECTS_SUMMARY_URL = `${PROJECT_RESERVATIONS_URL}/summary`;
export const SUBJECTS_LOOKUP_URL = `${environment.apiUrl}/subjects/lookup`;
export const STUDENTS_LOOKUP_URL = `${environment.apiUrl}/admin/students/lookup`;
export const RESERVATIONS_URL = `${environment.apiUrl}/admin/reservations`;
export const paymentHistoryUrl = (reservationId: number) =>
  `${environment.apiUrl}/admin/reservations/${reservationId}/payments`;
export const STUDENT_PROJECT_RESERVATIONS_URL = `${environment.apiUrl}/student/reservations/projects`;
export const STUDENT_PROJECTS_SUMMARY_URL = `${environment.apiUrl}/student/reservations/projects/summary`;
export const studentPaymentHistoryUrl = (reservationId: number) =>
  `${environment.apiUrl}/student/reservations/${reservationId}/payments`;

export const SUBJECTS_LOOKUP = [
  { id: 1, subjectName: 'Baze podataka' },
  { id: 2, subjectName: 'Web programiranje' },
];

export const STUDENTS_LOOKUP = [
  { id: 'student-1', fullName: 'Marko Jovanović', email: 'marko.jovanovic@example.com' },
  { id: 'student-2', fullName: 'Jelena Petrović', email: 'jelena.petrovic@example.com' },
];

export function createProjectListItem(overrides: Partial<ProjectListItem> = {}): ProjectListItem {
  return {
    id: 10,
    name: 'Biblioteka',
    subjectId: 1,
    subjectName: 'Baze podataka',
    projectType: ProjectType.Seminar,
    price: 6000,
    progress: 40,
    reservedAt: '2026-10-01',
    startDate: '2026-10-02',
    endDate: '2026-10-20',
    githubLink: null,
    downloadLink: null,
    notesCount: 2,
    ...overrides,
  };
}

export function createProjectReservation(
  overrides: Partial<ProjectReservationItem> = {},
): ProjectReservationItem {
  return {
    id: 1,
    studentId: 'student-1',
    studentFullName: 'Marko Jovanović',
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.PartiallyPaid,
    totalPrice: 10000,
    paidAmount: 4000,
    discountRate: 0,
    bonus: 0,
    description: null,
    createdAt: '2026-10-01T10:00:00Z',
    deletedAt: null,
    reservedAt: '2026-10-01T10:00:00Z',
    isHardDeletable: false,
    projects: [createProjectListItem()],
    ...overrides,
  };
}

export function createPagedProjectReservations(
  items: ProjectReservationItem[] = [createProjectReservation()],
  overrides: Partial<PagedResult<ProjectReservationItem>> = {},
): PagedResult<ProjectReservationItem> {
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

export function createProjectsSummary(overrides: Partial<ProjectsSummary> = {}): ProjectsSummary {
  return {
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    pendingProjects: 0,
    reservations: createPagedProjectReservations(),
    ...overrides,
  };
}

export function createProjectReservationDetails(
  overrides: Partial<ProjectReservationDetails> = {},
): ProjectReservationDetails {
  return {
    id: 7,
    studentId: 'student-2',
    studentFullName: 'Jelena Petrović',
    studentEmail: 'jelena.petrovic@example.com',
    description: 'Seminarski iz baza',
    studentUniversity: null,
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.PartiallyPaid,
    totalPrice: 9000,
    paidAmount: 3000,
    discountRate: 0,
    reservedAt: '2026-10-01',
    bonus: 0,
    notes: null,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: null,
    deletedAt: null,
    isHardDeletable: false,
    projects: [
      {
        id: 21,
        name: 'Biblioteka',
        subjectId: 1,
        subjectName: 'Baze podataka',
        projectType: ProjectType.Seminar,
        price: 9000,
        progress: 50,
        githubLink: 'https://github.com/jelena/baze',
        downloadLink: null,
        reservedAt: '2026-10-01',
        startDate: '2026-10-02',
        endDate: '2026-10-20',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: null,
        notes: [
          { id: 31, content: 'Dodati ER dijagram', createdAt: '2026-10-01', updatedAt: null },
        ],
        notesToDelete: [],
      },
    ],
    ...overrides,
  };
}

export function createStudentProjectReservationDetails(
  overrides: Partial<StudentProjectReservationDetails> = {},
): StudentProjectReservationDetails {
  const {
    studentId: _studentId,
    studentFullName: _studentFullName,
    studentEmail: _studentEmail,
    studentUniversity: _studentUniversity,
    notes: _notes,
    deletedAt: _deletedAt,
    isHardDeletable: _isHardDeletable,
    projects,
    ...reservation
  } = createProjectReservationDetails();

  return {
    ...reservation,
    adminId: 'admin-1',
    adminFullName: 'Nikola Marković',
    adminEmail: 'admin@example.com',
    projects: projects.map(({ notesToDelete: _notesToDelete, ...project }) => project),
    ...overrides,
  };
}

export function createProjectDetails(overrides: Partial<ProjectDetails> = {}): ProjectDetails {
  return {
    id: 10,
    reservationId: 1,
    subjectId: 1,
    subjectName: 'Baze podataka',
    projectType: ProjectType.Seminar,
    price: 6000,
    progress: 40,
    githubLink: null,
    downloadLink: null,
    reservedAt: '2026-10-01',
    startDate: '2026-10-02',
    endDate: '2026-10-20',
    isDeleted: false,
    isReservationArchived: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: null,
    notes: [
      { id: 11, content: 'Normalizovati tabele', createdAt: '2026-10-01', updatedAt: null },
      { id: 12, content: 'Napisati upite', createdAt: '2026-10-02', updatedAt: null },
    ],
    ...overrides,
  };
}

export function provideReservationRoute(reservationId: string | null) {
  return [
    provideRouter([
      { path: 'admin/projects', children: [] },
      { path: 'student/projects', children: [] },
      { path: 'admin/projects/update/:id', children: [] },
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

export async function flushProjectsSummary(summary: ProjectsSummary = createProjectsSummary()) {
  await flushLookups();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === PROJECTS_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

export function expectProjectReservationsRequest(params: Record<string, string | string[]>) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === PROJECT_RESERVATIONS_URL &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        Array.isArray(value)
          ? JSON.stringify(req.params.getAll(key) ?? []) === JSON.stringify(value)
          : req.params.get(key) === value,
      ),
  );
}

export function provideReservationFormTesting(reservationId: string | null) {
  return [ProjectFormService, AdminProjectReservationStore, provideReservationRoute(reservationId)];
}

export function expectReservationDetailsRequest(reservationId = 7) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) => req.url === `${PROJECT_RESERVATIONS_URL}/${reservationId}` && req.method === 'GET',
  );
}

export function flushReservationDetailsRefetch(
  details: ProjectReservationDetails = createProjectReservationDetails(),
) {
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === `${PROJECT_RESERVATIONS_URL}/${details.id}` && req.method === 'GET')
    .forEach((req) => req.flush(details));
}

export function createValidReservationModel(
  overrides: Partial<ProjectReservationFormModel> = {},
): ProjectReservationFormModel {
  return {
    ...createEmptyReservation(),
    studentId: 'student-1',
    totalPrice: 6000,
    projects: [
      {
        ...createEmptyProject(),
        name: 'Biblioteka',
        subjectId: 1,
        subjectName: 'Baze podataka',
        price: 6000,
      },
    ],
    ...overrides,
  };
}

export function createStudentProjectReservation(
  overrides: Partial<StudentProjectReservationItem> = {},
): StudentProjectReservationItem {
  const {
    studentId: _studentId,
    studentFullName: _studentFullName,
    deletedAt: _deletedAt,
    isHardDeletable: _isHardDeletable,
    ...reservation
  } = createProjectReservation();

  return { ...reservation, updatedAt: null, ...overrides };
}

export function createStudentProjectsSummary(
  overrides: Partial<StudentProjectsSummary> = {},
): StudentProjectsSummary {
  const items = [createStudentProjectReservation()];
  return {
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    pendingProjects: 0,
    reservations: {
      items,
      totalCount: items.length,
      pageNumber: 1,
      pageSize: 15,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      paginatedCount: items.length,
    },
    ...overrides,
  };
}

export async function flushStudentProjectsSummary(
  summary: StudentProjectsSummary = createStudentProjectsSummary(),
) {
  await flushLookups();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === STUDENT_PROJECTS_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

export function expectStudentProjectReservationsRequest(params: Record<string, string | string[]>) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === STUDENT_PROJECT_RESERVATIONS_URL &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        Array.isArray(value)
          ? JSON.stringify(req.params.getAll(key) ?? []) === JSON.stringify(value)
          : req.params.get(key) === value,
      ),
  );
}
