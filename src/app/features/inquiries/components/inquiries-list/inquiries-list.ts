import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCheck,
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidCircleCheck,
  faSolidLayerGroup,
  faSolidTrash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '@core/models/paged-result';
import { Button } from '@shared/components/button/button';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { InquiriesFilterBy } from '@features/inquiries/models/inquiries-filter-by';
import { InquiriesSortBy } from '@features/inquiries/models/inquiries-sort-by';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import {
  CONFLICTING_INQUIRY_STATUS_FILTERS,
  INQUIRY_SORT_LABELS,
  INQUIRY_STATUS_FILTER_LABELS,
  INQUIRY_TYPE_FILTER_LABELS,
  InquiryStatusFilter,
  InquiryTypeFilter,
} from '@features/inquiries/utilities/inquiry-labels';
import { InquiryCard } from '../inquiry-card/inquiry-card';

@Component({
  imports: [InquiryCard, Button, FilterMenu, SearchBar, SortMenu, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidCheck,
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidCircleCheck,
      faSolidLayerGroup,
      faSolidTrash,
      faSolidXmark,
    }),
  ],
  selector: 'app-inquiries-list',
  styleUrl: './inquiries-list.css',
  templateUrl: './inquiries-list.html',
})
export class InquiriesList {
  pagedInquiries = input.required<PagedResult<InquiryItem> | undefined>();
  selectedInquiryId = input<number | undefined>(undefined);
  checkedIds = input<number[]>([]);
  selectedSort = input<InquiriesSortBy>(InquiriesSortBy.CreatedAtDescending);
  selectedFilters = input<InquiriesFilterBy[]>([]);
  isPending = input<boolean>(false);
  isFetching = input<boolean>(false);
  isDeleting = input<boolean>(false);

  inquirySelected = output<InquiryItem | undefined>();
  checkedToggled = output<number>();
  allCheckedToggled = output<boolean>();
  deleteChecked = output<void>();
  searchChanged = output<string>();
  sortChanged = output<InquiriesSortBy>();
  filtersChanged = output<InquiriesFilterBy[]>();
  pageChanged = output<number>();

  sortOptions = INQUIRY_SORT_LABELS;
  statusOptions = INQUIRY_STATUS_FILTER_LABELS;
  conflictingStatusOptions = CONFLICTING_INQUIRY_STATUS_FILTERS;
  typeOptions = INQUIRY_TYPE_FILTER_LABELS;

  selectedStatusFilters = computed(() =>
    this.selectedFilters().filter((filter): filter is InquiryStatusFilter =>
      Object.hasOwn(this.statusOptions, filter),
    ),
  );
  selectedTypeFilters = computed(() =>
    this.selectedFilters().filter((filter): filter is InquiryTypeFilter =>
      Object.hasOwn(this.typeOptions, filter),
    ),
  );

  inquiries = computed(() => this.pagedInquiries()?.items);
  skeletonItems = computed(() => Array.from({ length: 6 }));
  totalCount = computed(() => this.pagedInquiries()?.totalCount ?? 0);
  paginatedCount = computed(() => this.pagedInquiries()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedInquiries()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedInquiries()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedInquiries()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedInquiries()?.hasNextPage ?? false);

  checkedCount = computed(() => this.checkedIds().length);
  areAllChecked = computed(() => {
    const items = this.inquiries() ?? [];
    return items.length > 0 && items.every((inquiry) => this.checkedIds().includes(inquiry.id));
  });

  selectAllClasses = computed(() =>
    this.areAllChecked()
      ? 'bg-amber-500 border-amber-500'
      : 'bg-emerald-950/60 border-emerald-400 hover:bg-emerald-800',
  );

  isChecked(inquiryId: number) {
    return this.checkedIds().includes(inquiryId);
  }

  onInquirySelected(inquiry: InquiryItem | undefined) {
    this.inquirySelected.emit(inquiry);
  }

  onCheckedToggled(inquiryId: number) {
    this.checkedToggled.emit(inquiryId);
  }

  onAllCheckedToggled() {
    this.allCheckedToggled.emit(!this.areAllChecked());
  }

  onDeleteChecked() {
    this.deleteChecked.emit();
  }

  onSearchInput(searchTerm: string) {
    this.searchChanged.emit(searchTerm);
  }

  onSortChanged(sortBy: InquiriesSortBy) {
    this.sortChanged.emit(sortBy);
  }

  onStatusFiltersChanged(statusFilters: InquiryStatusFilter[]) {
    this.filtersChanged.emit([...statusFilters, ...this.selectedTypeFilters()]);
  }

  onTypeFiltersChanged(typeFilters: InquiryTypeFilter[]) {
    this.filtersChanged.emit([...this.selectedStatusFilters(), ...typeFilters]);
  }

  onPreviousPage() {
    if (!this.hasPreviousPage()) return;
    this.pageChanged.emit(this.currentPage() - 1);
  }

  onNextPage() {
    if (!this.hasNextPage()) return;
    this.pageChanged.emit(this.currentPage() + 1);
  }
}
