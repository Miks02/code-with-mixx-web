import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle, wait } from '@core/testing/test-utils';
import { InquiriesFilterBy } from '@features/inquiries/models/inquiries-filter-by';
import { InquiriesSortBy } from '@features/inquiries/models/inquiries-sort-by';
import { InquiryService } from '@features/inquiries/services/inquiry-service';
import {
  createInquiriesSummary,
  createInquiry,
  createPagedInquiries,
  expectInquiriesRequest,
  flushInquiriesSummary,
  INQUIRIES_SUMMARY_URL,
  INQUIRIES_URL,
} from '@features/inquiries/testing/inquiry-test-utils';
import { AdminInquiryStore } from './admin-inquiry-store';

describe('AdminInquiryStore', () => {
  let store: InstanceType<typeof AdminInquiryStore>;
  let http: HttpTestingController;

  const firstPage = createPagedInquiries(
    [createInquiry({ id: 1 }), createInquiry({ id: 2, firstName: 'Marko' })],
    { totalCount: 4, totalPages: 2, hasNextPage: true },
  );
  const secondPage = createPagedInquiries([createInquiry({ id: 3 }), createInquiry({ id: 4 })], {
    totalCount: 4,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const loadFirstPage = () =>
    flushInquiriesSummary(createInquiriesSummary({ pagedInquiries: firstPage }));

  const goToSecondPage = async () => {
    await loadFirstPage();
    store.nextPage();
    await settle();
    expectInquiriesRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminInquiryStore, provideHttpTesting()] });
    store = TestBed.inject(AdminInquiryStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('initial state', () => {
    it('starts on the first page, newest first, without filters', async () => {
      expect(store.params()).toEqual({
        pageNumber: 1,
        pageSize: 15,
        searchTerm: '',
        sortBy: InquiriesSortBy.CreatedAtDescending,
        filters: [],
      });
      await flushInquiriesSummary();
    });

    it('requests the summary with the current params', async () => {
      await settle();
      const request = http.expectOne((req) => req.url === INQUIRIES_SUMMARY_URL);
      expect(request.request.params.get('pageNumber')).toBe('1');
      expect(request.request.params.get('sortBy')).toBe(InquiriesSortBy.CreatedAtDescending);
      request.flush(createInquiriesSummary());
      await settle();
    });

    it('uses safe defaults while loading', async () => {
      await settle();
      expect(store.summaryPending()).toBe(true);
      expect(store.inquiriesPending()).toBe(true);
      expect(store.pagedItems()).toBeUndefined();
      expect(store.selectedInquiry()).toBeUndefined();
      expect(store.checkedIds()).toEqual([]);
      expect(store.areAllChecked()).toBe(false);
      await flushInquiriesSummary();
    });
  });

  describe('after the summary loads', () => {
    beforeEach(loadFirstPage);

    it('exposes the summary and the first page without a second request', () => {
      expect(store.summaryPending()).toBe(false);
      expect(store.summary()?.totalInquiries).toBe(1);
      expect(store.pagedItems()?.map((inquiry) => inquiry.id)).toEqual([1, 2]);
    });

    it('selects the first inquiry automatically', () => {
      expect(store.selectedInquiry()?.id).toBe(1);
      expect(store.selectedInquiryId()).toBe(1);
    });
  });

  describe('selection', () => {
    beforeEach(loadFirstPage);

    it('selectInquiry selects another inquiry or clears the selection', () => {
      store.selectInquiry(firstPage.items[1]);
      expect(store.selectedInquiryId()).toBe(2);

      store.selectInquiry(undefined);
      expect(store.selectedInquiry()).toBeUndefined();
    });

    it('keeps the selected inquiry with fresh data after a refetch', async () => {
      store.selectInquiry(firstPage.items[1]);

      const resolve = TestBed.inject(InquiryService).resolveInquiryMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${INQUIRIES_URL}/2/resolve`).flush(createInquiry({ id: 2 }));
      await flushInquiriesSummary(
        createInquiriesSummary({
          pagedInquiries: {
            ...firstPage,
            items: [firstPage.items[0], { ...firstPage.items[1], isResolved: true }],
          },
        }),
      );
      await resolve;

      expect(store.selectedInquiryId()).toBe(2);
      expect(store.selectedInquiry()?.isResolved).toBe(true);
    });

    it('falls back to the first inquiry when the selected one disappears', async () => {
      store.selectInquiry(firstPage.items[1]);

      const remove = TestBed.inject(InquiryService).deleteInquiryMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${INQUIRIES_URL}/2`).flush(null);
      await flushInquiriesSummary(
        createInquiriesSummary({ pagedInquiries: { ...firstPage, items: [firstPage.items[0]] } }),
      );
      await remove;

      expect(store.selectedInquiryId()).toBe(1);
    });
  });

  describe('checking', () => {
    beforeEach(loadFirstPage);

    it('toggleChecked adds and removes an id', () => {
      store.toggleChecked(2);
      expect(store.checkedIds()).toEqual([2]);
      expect(store.checkedCount()).toBe(1);

      store.toggleChecked(2);
      expect(store.checkedIds()).toEqual([]);
    });

    it('toggleAllChecked checks every inquiry on the page, then none', () => {
      store.toggleAllChecked();
      expect(store.checkedIds()).toEqual([1, 2]);
      expect(store.areAllChecked()).toBe(true);

      store.toggleAllChecked();
      expect(store.checkedIds()).toEqual([]);
      expect(store.areAllChecked()).toBe(false);
    });

    it('toggleAllChecked checks the rest when only some are checked', () => {
      store.toggleChecked(1);
      store.toggleAllChecked();
      expect(store.checkedIds()).toEqual([1, 2]);
    });

    it('drops checked ids that are not on the newly loaded page', async () => {
      store.toggleAllChecked();

      store.nextPage();
      await settle();
      expectInquiriesRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();

      expect(store.checkedIds()).toEqual([]);
    });
  });

  describe('pagination', () => {
    it('nextPage and previousPage move between existing pages only', async () => {
      await loadFirstPage();

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);

      store.nextPage();
      await settle();
      expectInquiriesRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(store.params.pageNumber()).toBe(2);

      store.nextPage();
      await settle();
      expect(store.params.pageNumber()).toBe(2);

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);
      expect(store.pagedItems()?.map((inquiry) => inquiry.id)).toEqual([1, 2]);
    });

    it('moves to the last page that still has inquiries when the current one becomes empty', async () => {
      await goToSecondPage();

      const remove = TestBed.inject(InquiryService).deleteInquiriesMutation.mutateAsync([3, 4]);
      await settle();
      http
        .expectOne((req) => req.url === INQUIRIES_URL && req.method === 'DELETE')
        .flush({ deletedCount: 2 });
      await flushInquiriesSummary(
        createInquiriesSummary({
          pagedInquiries: createPagedInquiries([], { pageNumber: 2, totalPages: 1 }),
        }),
      );
      await remove;

      expect(store.params.pageNumber()).toBe(1);
      // The delete invalidated the cached first page, so it is loaded again.
      expectInquiriesRequest({ pageNumber: '1' }).flush(
        createPagedInquiries([createInquiry({ id: 1 }), createInquiry({ id: 2 })]),
      );
      await settle();
      expect(store.pagedItems()?.map((inquiry) => inquiry.id)).toEqual([1, 2]);
    });
  });

  describe('filters, sort and search', () => {
    it('setStatusFilters keeps the type filters and goes back to the first page', async () => {
      await goToSecondPage();
      store.setTypeFilters([InquiriesFilterBy.Project]);
      await settle();
      expectInquiriesRequest({ filters: [InquiriesFilterBy.Project] }).flush(firstPage);
      await settle();

      store.setStatusFilters([InquiriesFilterBy.Resolved]);
      await settle();

      expect(store.params.filters()).toEqual([
        InquiriesFilterBy.Resolved,
        InquiriesFilterBy.Project,
      ]);
      expect(store.selectedStatusFilters()).toEqual([InquiriesFilterBy.Resolved]);
      expect(store.selectedTypeFilters()).toEqual([InquiriesFilterBy.Project]);
      expect(store.params.pageNumber()).toBe(1);
      expectInquiriesRequest({
        pageNumber: '1',
        filters: [InquiriesFilterBy.Resolved, InquiriesFilterBy.Project],
      }).flush(firstPage);
      await settle();
    });

    it('setTypeFilters keeps the status filters', async () => {
      await loadFirstPage();
      store.setStatusFilters([InquiriesFilterBy.Unresolved]);
      await settle();
      expectInquiriesRequest({ filters: [InquiriesFilterBy.Unresolved] }).flush(firstPage);
      await settle();

      store.setTypeFilters([InquiriesFilterBy.Other]);
      await settle();

      expect(store.params.filters()).toEqual([
        InquiriesFilterBy.Unresolved,
        InquiriesFilterBy.Other,
      ]);
      expectInquiriesRequest({
        filters: [InquiriesFilterBy.Unresolved, InquiriesFilterBy.Other],
      }).flush(firstPage);
      await settle();
    });

    it('setSort changes the sort and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSort(InquiriesSortBy.NameAscending);
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expectInquiriesRequest({ pageNumber: '1', sortBy: InquiriesSortBy.NameAscending }).flush(
        firstPage,
      );
      await settle();
    });

    it('setSearchTerm is debounced, trimmed and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSearchTerm('  ana  ');
      await settle();
      expect(store.params.searchTerm()).toBe('');

      await wait(350);
      await settle();

      expect(store.params.searchTerm()).toBe('ana');
      expect(store.params.pageNumber()).toBe(1);
      expectInquiriesRequest({ pageNumber: '1', searchTerm: 'ana' }).flush(firstPage);
      await settle();
    });

    it('setSearchTerm ignores a term that only adds whitespace', async () => {
      await goToSecondPage();

      store.setSearchTerm('   ');
      await wait(350);
      await settle();

      expect(store.params.searchTerm()).toBe('');
      expect(store.params.pageNumber()).toBe(2);
    });
  });

  describe('mutation flags', () => {
    it('isResolving is true while an inquiry is being resolved', async () => {
      await loadFirstPage();
      expect(store.isResolving()).toBe(false);

      const resolve = TestBed.inject(InquiryService).resolveInquiryMutation.mutateAsync(1);
      await settle();
      expect(store.isResolving()).toBe(true);

      http.expectOne(`${INQUIRIES_URL}/1/resolve`).flush(createInquiry());
      await flushInquiriesSummary();
      await resolve;
      expect(store.isResolving()).toBe(false);
    });
  });
});
