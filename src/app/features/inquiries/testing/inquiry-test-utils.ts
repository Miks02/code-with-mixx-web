import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { PagedResult } from '@core/models/paged-result';
import { settle } from '@core/testing/test-utils';
import { InquiriesSummary } from '@features/inquiries/models/inquiries-summary';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';

export const INQUIRIES_URL = `${environment.apiUrl}/admin/inquiries`;
export const INQUIRIES_SUMMARY_URL = `${environment.apiUrl}/admin/inquiries/summary`;

export function createInquiry(overrides: Partial<InquiryItem> = {}): InquiryItem {
  return {
    id: 1,
    firstName: 'Ana',
    lastName: 'Anić',
    email: 'ana@example.com',
    phoneNumber: '+381601234567',
    message: 'Zanimaju me časovi programiranja u JavaScript-u.',
    inquiryType: InquiryType.IndividualClasses,
    isResolved: false,
    resolvedAt: null,
    resolvedByAdminId: null,
    resolvedByAdminName: null,
    createdAt: '2026-11-01T10:00:00Z',
    ...overrides,
  };
}

export function createPagedInquiries(
  items: InquiryItem[] = [createInquiry()],
  overrides: Partial<PagedResult<InquiryItem>> = {},
): PagedResult<InquiryItem> {
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

export function createInquiriesSummary(
  overrides: Partial<InquiriesSummary> = {},
): InquiriesSummary {
  return {
    totalInquiries: 1,
    unresolvedInquiries: 1,
    resolvedInquiries: 0,
    pagedInquiries: createPagedInquiries(),
    ...overrides,
  };
}

/** Answers every pending summary request (the store fires one on creation and after mutations). */
export async function flushInquiriesSummary(summary: InquiriesSummary = createInquiriesSummary()) {
  await settle();
  TestBed.inject(HttpTestingController)
    .match((req) => req.url === INQUIRIES_SUMMARY_URL)
    .forEach((req) => req.flush(summary));
  await settle();
}

export function expectInquiriesRequest(params: Record<string, string | string[]>) {
  return TestBed.inject(HttpTestingController).expectOne(
    (req) =>
      req.url === INQUIRIES_URL &&
      req.method === 'GET' &&
      Object.entries(params).every(([key, value]) =>
        Array.isArray(value)
          ? JSON.stringify(req.params.getAll(key) ?? []) === JSON.stringify(value)
          : req.params.get(key) === value,
      ),
  );
}
