import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '@environments/environment';
import { InquiriesSummary } from '@features/inquiries/models/inquiries-summary';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';
import { InquiriesPage } from './inquiries-page';

const createInquiry = (id: number): InquiryItem => ({
  id,
  firstName: 'Ana',
  lastName: 'Anić',
  email: 'ana@example.com',
  phoneNumber: '+381601234567',
  message: 'Zanimaju me časovi programiranja.',
  inquiryType: InquiryType.IndividualClasses,
  isResolved: false,
  resolvedAt: null,
  resolvedByAdminId: null,
  resolvedByAdminName: null,
  createdAt: '2026-11-01T10:00:00Z',
});

const summaryResponse: InquiriesSummary = {
  totalInquiries: 20,
  unresolvedInquiries: 20,
  resolvedInquiries: 0,
  pagedInquiries: {
    items: [createInquiry(1), createInquiry(2)],
    totalCount: 20,
    pageNumber: 1,
    pageSize: 15,
    totalPages: 2,
    hasPreviousPage: false,
    hasNextPage: true,
    paginatedCount: 2,
  },
};

describe('InquiriesPage', () => {
  let fixture: ComponentFixture<InquiriesPage>;
  let httpTesting: HttpTestingController;

  const isPagedRequest = (url: string) => url === `${environment.apiUrl}/admin/inquiries`;
  const isSummaryRequest = (url: string) => url === `${environment.apiUrl}/admin/inquiries/summary`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiriesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTanStackQuery(
          new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 5 * 60 * 1000 } },
          }),
        ),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InquiriesPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => httpTesting.verify());

  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();
  };

  it('should load the first page only through the summary request', async () => {
    httpTesting.expectOne((req) => isSummaryRequest(req.url)).flush(summaryResponse);
    await settle();
    await settle();

    httpTesting.expectNone((req) => isPagedRequest(req.url));
    expect(fixture.componentInstance.inquiriesData()?.items.length).toBe(2);
    expect(fixture.componentInstance.selectedInquiry()?.id).toBe(1);
  });

  it('should send a single paged request when the page changes', async () => {
    httpTesting.expectOne((req) => isSummaryRequest(req.url)).flush(summaryResponse);
    await settle();

    fixture.componentInstance.onPageChange(2);
    await settle();

    const request = httpTesting.expectOne((req) => isPagedRequest(req.url));
    expect(request.request.params.get('pageNumber')).toBe('2');
    request.flush({ ...summaryResponse.pagedInquiries, pageNumber: 2 });
    await settle();

    httpTesting.expectNone((req) => isSummaryRequest(req.url));
  });
});
