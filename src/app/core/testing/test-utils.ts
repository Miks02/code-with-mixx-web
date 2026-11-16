import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { httpErrorInterceptor } from '@core/interceptors/http-error-interceptor';
import { ProblemDetails } from '@core/models/problem-details';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';

export function createToastServiceMock() {
  return { showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
}

export function createDialogServiceMock() {
  return { showDialog: vi.fn() };
}

/**
 * HttpClient (with the real error interceptor), HttpTestingController, a QueryClient configured like
 * the app's, and mocked ToastService/DialogService.
 */
export function provideHttpTesting({
  toastService = createToastServiceMock(),
  dialogService = createDialogServiceMock(),
} = {}) {
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
    { provide: DialogService, useValue: dialogService },
  ];
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

/** Lets Angular effects, change detection and TanStack's promise callbacks run. */
export async function settle() {
  for (let i = 0; i < 3; i++) {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
