import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';
import {
  createInquiriesSummary,
  createInquiry,
  createPagedInquiries,
  expectInquiriesRequest,
  flushInquiriesSummary,
  INQUIRIES_URL,
} from '@features/inquiries/testing/inquiry-test-utils';
import { InquiriesPage } from './inquiries-page';

describe('InquiriesPage', () => {
  let fixture: ComponentFixture<InquiriesPage>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminInquiryStore>;
  let http: HttpTestingController;

  const summary = createInquiriesSummary({
    totalInquiries: 20,
    unresolvedInquiries: 12,
    resolvedInquiries: 8,
    pagedInquiries: createPagedInquiries([createInquiry({ id: 1 }), createInquiry({ id: 2 })], {
      totalCount: 20,
      totalPages: 2,
      hasNextPage: true,
    }),
  });

  const statsValues = () =>
    Array.from(element.querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiriesPage],
      providers: [provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiriesPage);
    element = fixture.nativeElement;
    store = fixture.debugElement.injector.get(AdminInquiryStore);
    http = TestBed.inject(HttpTestingController);

    await flushInquiriesSummary(summary);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('loads the first page only through the summary request', () => {
    http.expectNone((req) => req.url === INQUIRIES_URL);
    expect(element.querySelectorAll('app-inquiry-card').length).toBe(2);
    expect(element.querySelector('app-inquiry-details h2')?.textContent).toContain('Ana Anić');
  });

  it('shows total, unresolved and resolved counts from the summary', () => {
    expect(statsValues()).toEqual(['20', '12', '8']);
  });

  it('sends a single paged request (and no summary) when the page changes', async () => {
    store.nextPage();
    await settle();

    expectInquiriesRequest({ pageNumber: '2' }).flush(
      createPagedInquiries([createInquiry({ id: 3 })], { pageNumber: 2, hasPreviousPage: true }),
    );
    await settle();

    http.expectNone((req) => req.url.endsWith('/summary'));
  });

  it('gets its own store instance', () => {
    expect(() => TestBed.inject(AdminInquiryStore)).toThrow();
  });
});
