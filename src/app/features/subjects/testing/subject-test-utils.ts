import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { PagedResult } from '@core/models/paged-result';
import { createToastServiceMock, provideHttpTesting, settle } from '@core/testing/test-utils';
import { StudentSubjectItem } from '@features/subjects/student/models/student-subject-item';
import { StudentSubjectsSummary } from '@features/subjects/student/models/student-subjects-summary';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { SubjectsSummary } from '@features/subjects/models/subjects-summary';

export {
  createProblemDetails,
  createToastServiceMock,
  getButton,
  settle,
  typeInto,
} from '@core/testing/test-utils';

export const SUBJECTS_URL = `${environment.apiUrl}/admin/subjects`;
export const SUBJECTS_SUMMARY_URL = `${environment.apiUrl}/admin/subjects/summary`;
export const STUDENT_SUBJECTS_URL = `${environment.apiUrl}/student/subjects`;
export const STUDENT_SUBJECTS_SUMMARY_URL = `${environment.apiUrl}/student/subjects/summary`;

export function createSubject(overrides: Partial<SubjectItem> = {}): SubjectItem {
  return {
    id: 1,
    subjectName: 'Osnove programiranja',
    subjectDescription: 'Promenljive, petlje i funkcije u JavaScript-u',
    classesCount: 4,
    studentsCount: 7,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

export function createPagedSubjects(
  items: SubjectItem[] = [createSubject()],
  overrides: Partial<PagedResult<SubjectItem>> = {},
): PagedResult<SubjectItem> {
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

export function createSubjectsSummary(overrides: Partial<SubjectsSummary> = {}): SubjectsSummary {
  return {
    totalSubjects: 1,
    taughtSubjects: 1,
    untaughtSubjects: 0,
    mostPopularSubject: createSubject(),
    pagedSubjects: createPagedSubjects(),
    ...overrides,
  };
}

export function provideSubjectTesting(toastService = createToastServiceMock()) {
  return provideHttpTesting({ toastService });
}

/** Answers every pending summary request (the store fires one on creation and after mutations). */
export async function flushSummary(summary: SubjectsSummary = createSubjectsSummary()) {
  await settle();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === SUBJECTS_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

export function createStudentSubject(
  overrides: Partial<StudentSubjectItem> = {},
): StudentSubjectItem {
  return {
    id: 1,
    subjectName: 'Osnove programiranja',
    subjectDescription: 'Promenljive, petlje i funkcije u JavaScript-u',
    classesCount: 4,
    ...overrides,
  };
}

export function createPagedStudentSubjects(
  items: StudentSubjectItem[] = [createStudentSubject()],
  overrides: Partial<PagedResult<StudentSubjectItem>> = {},
): PagedResult<StudentSubjectItem> {
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

export function createStudentSubjectsSummary(
  overrides: Partial<StudentSubjectsSummary> = {},
): StudentSubjectsSummary {
  return {
    totalSubjects: 1,
    taughtSubjects: 1,
    untaughtSubjects: 0,
    mostPopularSubject: createStudentSubject(),
    lastSubjectClass: { subjectName: 'Osnove programiranja', classDate: '2026-11-20' },
    pagedSubjects: createPagedStudentSubjects(),
    ...overrides,
  };
}

export async function flushStudentSummary(
  summary: StudentSubjectsSummary = createStudentSubjectsSummary(),
) {
  await settle();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === STUDENT_SUBJECTS_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}
