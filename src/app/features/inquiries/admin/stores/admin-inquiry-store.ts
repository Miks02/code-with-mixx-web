import { computed, effect, inject, linkedSignal, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withLinkedState,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, pipe, tap } from 'rxjs';
import { InquiriesFilterBy } from '@features/inquiries/models/inquiries-filter-by';
import { InquiriesSortBy } from '@features/inquiries/models/inquiries-sort-by';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryQueryParams } from '@features/inquiries/models/inquiry-query-params';
import { InquiryService } from '@features/inquiries/services/inquiry-service';
import {
  INQUIRY_STATUS_FILTER_LABELS,
  INQUIRY_TYPE_FILTER_LABELS,
  InquiryStatusFilter,
  InquiryTypeFilter,
} from '@features/inquiries/utilities/inquiry-labels';

type AdminInquiryState = {
  params: InquiryQueryParams;
  detailsScrollRequests: number;
};

const initialState: AdminInquiryState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: InquiriesSortBy.CreatedAtDescending,
    filters: [],
  },
  detailsScrollRequests: 0,
};

const isStatusFilter = (filter: InquiriesFilterBy): filter is InquiryStatusFilter =>
  Object.hasOwn(INQUIRY_STATUS_FILTER_LABELS, filter);

const isTypeFilter = (filter: InquiriesFilterBy): filter is InquiryTypeFilter =>
  Object.hasOwn(INQUIRY_TYPE_FILTER_LABELS, filter);

export const AdminInquiryStore = signalStore(
  withState(initialState),
  withProps((store, inquiryService = inject(InquiryService)) => {
    const summaryQuery = inquiryService.getInquiriesSummaryQuery(store.params);

    return {
      summaryQuery,
      inquiriesQuery: inquiryService.getPagedInquiriesQuery(store.params, summaryQuery),
      _inquiryService: inquiryService,
    };
  }),
  withLinkedState((store) => {
    const items = () => store.inquiriesQuery.data()?.items ?? [];

    return {
      selectedInquiry: linkedSignal<InquiryItem[], InquiryItem | undefined>({
        source: items,
        computation: (inquiries, previous) =>
          inquiries.find((inquiry) => inquiry.id === previous?.value?.id) ?? inquiries[0],
      }),
      checkedIds: linkedSignal<InquiryItem[], number[]>({
        source: items,
        computation: (inquiries, previous) =>
          (previous?.value ?? []).filter((id) => inquiries.some((inquiry) => inquiry.id === id)),
      }),
    };
  }),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    pagedItems: computed(() => store.inquiriesQuery.data()?.items),
    inquiriesPending: computed(() => store.inquiriesQuery.isPending()),
    inquiriesFetching: computed(() => store.inquiriesQuery.isFetching()),
    isResolving: computed(() => store._inquiryService.resolveInquiryMutation.isPending()),
    isDeleting: computed(() => store._inquiryService.deleteInquiryMutation.isPending()),
    isBulkDeleting: computed(() => store._inquiryService.deleteInquiriesMutation.isPending()),
    selectedInquiryId: computed(() => store.selectedInquiry()?.id),
    selectedStatusFilters: computed(() => store.params.filters().filter(isStatusFilter)),
    selectedTypeFilters: computed(() => store.params.filters().filter(isTypeFilter)),
    checkedCount: computed(() => store.checkedIds().length),
    areAllChecked: computed(() => {
      const items = store.inquiriesQuery.data()?.items ?? [];
      return items.length > 0 && items.every((inquiry) => store.checkedIds().includes(inquiry.id));
    }),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<InquiryQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setSearchTerm: rxMethod<string>(
        pipe(
          debounceTime(300),
          map((searchTerm) => searchTerm.trim()),
          distinctUntilChanged(),
          tap((searchTerm) => {
            if (searchTerm === store.params.searchTerm()) return;
            patchParams({ searchTerm, pageNumber: 1 });
          }),
        ),
      ),
      setSort(sortBy: InquiriesSortBy) {
        patchParams({ sortBy, pageNumber: 1 });
      },
      setStatusFilters(statusFilters: InquiryStatusFilter[]) {
        patchParams({ filters: [...statusFilters, ...store.selectedTypeFilters()], pageNumber: 1 });
      },
      setTypeFilters(typeFilters: InquiryTypeFilter[]) {
        patchParams({ filters: [...store.selectedStatusFilters(), ...typeFilters], pageNumber: 1 });
      },
      previousPage() {
        const page = store.inquiriesQuery.data();
        if (!page?.hasPreviousPage) return;
        patchParams({ pageNumber: page.pageNumber - 1 });
      },
      nextPage() {
        const page = store.inquiriesQuery.data();
        if (!page?.hasNextPage) return;
        patchParams({ pageNumber: page.pageNumber + 1 });
      },
      selectInquiry(inquiry: InquiryItem | undefined) {
        patchState(store, {
          selectedInquiry: inquiry,
          detailsScrollRequests: inquiry
            ? store.detailsScrollRequests() + 1
            : store.detailsScrollRequests(),
        });
      },
      toggleChecked(inquiryId: number) {
        const ids = store.checkedIds();
        patchState(store, {
          checkedIds: ids.includes(inquiryId)
            ? ids.filter((id) => id !== inquiryId)
            : [...ids, inquiryId],
        });
      },
      toggleAllChecked() {
        const items = store.pagedItems() ?? [];
        patchState(store, {
          checkedIds: store.areAllChecked() ? [] : items.map((inquiry) => inquiry.id),
        });
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect(() => {
        const paged = store.inquiriesQuery.data();
        if (!paged || paged.items.length > 0 || paged.pageNumber <= 1) return;

        const lastPage = Math.max(1, paged.totalPages);
        untracked(() => patchState(store, { params: { ...store.params(), pageNumber: lastPage } }));
      });
    },
  }),
);
