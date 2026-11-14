import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagedResult } from '@core/models/paged-result';
import { InquiriesFilterBy } from '@features/inquiries/models/inquiries-filter-by';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';
import { InquiriesList } from './inquiries-list';

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

const createPage = (overrides: Partial<PagedResult<InquiryItem>> = {}) => ({
  items: [createInquiry(1), createInquiry(2)],
  totalCount: 20,
  pageNumber: 1,
  pageSize: 15,
  totalPages: 2,
  hasPreviousPage: false,
  hasNextPage: true,
  paginatedCount: 2,
  ...overrides,
});

describe('InquiriesList', () => {
  let component: InquiriesList;
  let fixture: ComponentFixture<InquiriesList>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiriesList],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiriesList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pagedInquiries', createPage());
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a card per inquiry and the pagination summary', () => {
    expect(element.querySelectorAll('app-inquiry-card').length).toBe(2);
    expect(element.textContent).toContain('Prikazano 2 od 20');
    expect(element.textContent).toContain('1 / 2');
  });

  it('should show the empty state when there are no inquiries', () => {
    fixture.componentRef.setInput('pagedInquiries', createPage({ items: [], paginatedCount: 0 }));
    fixture.detectChanges();

    expect(element.querySelectorAll('app-inquiry-card').length).toBe(0);
    expect(element.textContent).toContain('Nije pronađen nijedan upit');
  });

  it('should show skeletons while pending', () => {
    fixture.componentRef.setInput('isPending', true);
    fixture.detectChanges();

    expect(element.querySelectorAll('app-inquiry-card').length).toBe(0);
    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
  });

  it('should split selected filters into status and type filters', () => {
    fixture.componentRef.setInput('selectedFilters', [
      InquiriesFilterBy.Resolved,
      InquiriesFilterBy.Project,
    ]);

    expect(component.selectedStatusFilters()).toEqual([InquiriesFilterBy.Resolved]);
    expect(component.selectedTypeFilters()).toEqual([InquiriesFilterBy.Project]);
  });

  it('should keep the other filter group when one group changes', () => {
    const emitted: InquiriesFilterBy[][] = [];
    component.filtersChanged.subscribe((value) => emitted.push(value));
    fixture.componentRef.setInput('selectedFilters', [
      InquiriesFilterBy.Resolved,
      InquiriesFilterBy.Project,
    ]);

    component.onStatusFiltersChanged([InquiriesFilterBy.Unresolved]);
    component.onTypeFiltersChanged([InquiriesFilterBy.Other]);

    expect(emitted).toEqual([
      [InquiriesFilterBy.Unresolved, InquiriesFilterBy.Project],
      [InquiriesFilterBy.Resolved, InquiriesFilterBy.Other],
    ]);
  });

  it('should toggle select all based on the current page', () => {
    const emitted: boolean[] = [];
    component.allCheckedToggled.subscribe((value) => emitted.push(value));

    component.onAllCheckedToggled();
    fixture.componentRef.setInput('checkedIds', [1, 2]);
    component.onAllCheckedToggled();

    expect(emitted).toEqual([true, false]);
  });

  it('should show the bulk delete action only while something is checked', () => {
    expect(element.textContent).not.toContain('Obriši označene');

    fixture.componentRef.setInput('checkedIds', [1]);
    fixture.detectChanges();

    expect(element.textContent).toContain('Označeno: 1');
    expect(element.textContent).toContain('Obriši označene');
  });

  it('should emit page changes only when the page exists', () => {
    const emitted: number[] = [];
    component.pageChanged.subscribe((value) => emitted.push(value));

    component.onPreviousPage();
    component.onNextPage();

    expect(emitted).toEqual([2]);
  });
});
