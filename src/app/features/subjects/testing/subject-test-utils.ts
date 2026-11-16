import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '@environments/environment';
import { httpErrorInterceptor } from '@core/interceptors/http-error-interceptor';
import { PagedResult } from '@core/models/paged-result';
import { ProblemDetails } from '@core/models/problem-details';
import { ToastService } from '@core/services/toast-service';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { SubjectsSummary } from '@features/subjects/models/subjects-summary';

export const SUBJECTS_URL = `${environment.apiUrl}/admin/subjects`;
export const SUBJECTS_SUMMARY_URL = `${environment.apiUrl}/admin/subjects/summary`;

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

export function createProblemDetails(
  errorCode: string,
  overrides: Partial<ProblemDetails> = {},
): ProblemDetails {
  return {
    type: 'about:blank',
    title: errorCode,
    status: 409,
    detail: errorCode,
    errorCode,
    ...overrides,
  };
}

export function createToastServiceMock() {
  return { showError: vi.fn(), showSuccess: vi.fn() };
}

/**
 * HttpClient (with the real error interceptor), HttpTestingController, a QueryClient configured like
 * the app's, and a mocked ToastService.
 */
export function provideSubjectTesting(toastService = createToastServiceMock()) {
  return [
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideHttpClientTesting(),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 5 * 60 * 1000 },
          mutations: { retry: false },
        },
      }),
    ),
    { provide: ToastService, useValue: toastService },
  ];
}

/** Lets Angular effects, change detection and TanStack's promise callbacks run. */
export async function settle() {
  for (let i = 0; i < 3; i++) {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

/** Answers every pending summary request (the store fires one on creation and after mutations). */
export async function flushSummary(summary: SubjectsSummary = createSubjectsSummary()) {
  await settle();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === SUBJECTS_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

/** Finds a native button by its visible text (works for app-button too). */
export function getButton(root: HTMLElement, text: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.includes(text),
  );
}

export function typeInto(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  element.value = value;
  element.dispatchEvent(new Event('input'));
}
