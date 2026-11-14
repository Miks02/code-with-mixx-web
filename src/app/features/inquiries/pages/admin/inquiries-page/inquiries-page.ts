import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCircleCheck,
  faSolidEnvelope,
  faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { InquiryDetails } from '@features/inquiries/admin/components/inquiry-details/inquiry-details';
import { InquiriesList } from '@features/inquiries/components/inquiries-list/inquiries-list';
import { InquiriesFilterBy } from '@features/inquiries/models/inquiries-filter-by';
import { InquiriesSortBy } from '@features/inquiries/models/inquiries-sort-by';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryQueryParams } from '@features/inquiries/models/inquiry-query-params';
import { InquiryService } from '@features/inquiries/services/inquiry-service';
import { getInquiryErrorMessage } from '@features/inquiries/utilities/inquiry-error-messages';
import { INQUIRY_TOAST_MESSAGES } from '@features/inquiries/utilities/inquiry-toast-messages';

@Component({
  imports: [InquiriesList, InquiryDetails, StatsCard],
  providers: [provideIcons({ faSolidCircleCheck, faSolidEnvelope, faSolidHourglassHalf })],
  selector: 'app-inquiries-page',
  styleUrl: './inquiries-page.css',
  templateUrl: './inquiries-page.html',
})
export class InquiriesPage {
  private inquiryService = inject(InquiryService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);

  protected queryParams = signal<InquiryQueryParams>({
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: InquiriesSortBy.CreatedAtDescending,
    filters: [],
  });

  private searchTerm$ = new Subject<string>();
  private searchTerm = toSignal(this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()), {
    initialValue: '',
  });

  private inquiriesSummarySource = this.inquiryService.getInquiriesSummaryQuery(this.queryParams);
  private inquiriesSource = this.inquiryService.getPagedInquiriesQuery(
    this.queryParams,
    this.inquiriesSummarySource,
  );

  inquiriesSummaryData = computed(() => this.inquiriesSummarySource.data());
  inquiriesData = computed(() => this.inquiriesSource.data());

  inquiriesSummaryPending = computed(() => this.inquiriesSummarySource.isPending());
  inquiriesPending = computed(() => this.inquiriesSource.isPending());
  inquiriesFetching = computed(() => this.inquiriesSource.isFetching());

  isResolving = computed(() => this.inquiryService.resolveInquiryMutation.isPending());
  isDeleting = computed(() => this.inquiryService.deleteInquiryMutation.isPending());
  isBulkDeleting = computed(() => this.inquiryService.deleteInquiriesMutation.isPending());

  selectedInquiry = linkedSignal<InquiryItem[], InquiryItem | undefined>({
    source: () => this.inquiriesData()?.items ?? [],
    computation: (options, previous) =>
      options.find((o) => o.id === previous?.value?.id) ?? options[0],
  });

  checkedIds = linkedSignal<InquiryItem[], number[]>({
    source: () => this.inquiriesData()?.items ?? [],
    computation: (options, previous) =>
      (previous?.value ?? []).filter((id) => options.some((o) => o.id === id)),
  });

  constructor() {
    effect(() => {
      const searchTerm = this.searchTerm();

      untracked(() => {
        if (searchTerm === this.queryParams().searchTerm) return;
        this.queryParams.update((params) => ({ ...params, pageNumber: 1, searchTerm }));
      });
    });

    effect(() => {
      const paged = this.inquiriesData();
      if (!paged || paged.items.length > 0 || paged.pageNumber <= 1) return;

      const lastPage = Math.max(1, paged.totalPages);
      untracked(() => this.queryParams.update((params) => ({ ...params, pageNumber: lastPage })));
    });
  }

  onInquirySelected(inquiry: InquiryItem | undefined) {
    this.selectedInquiry.set(inquiry);
  }

  onCheckedToggled(inquiryId: number) {
    this.checkedIds.update((ids) =>
      ids.includes(inquiryId) ? ids.filter((id) => id !== inquiryId) : [...ids, inquiryId],
    );
  }

  onAllCheckedToggled(checked: boolean) {
    const ids = checked ? (this.inquiriesData()?.items ?? []).map((inquiry) => inquiry.id) : [];
    this.checkedIds.set(ids);
  }

  onSearchChange(term: string) {
    this.searchTerm$.next(term.trim());
  }

  onSortChange(sortBy: InquiriesSortBy) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, sortBy }));
  }

  onFiltersChange(filters: InquiriesFilterBy[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, filters }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }

  onResolveInquiry(inquiryId: number) {
    this.inquiryService.resolveInquiryMutation.mutate(inquiryId, {
      onSuccess: () => this.toastService.showSuccess(INQUIRY_TOAST_MESSAGES.resolveSuccess),
      onError: (err) => {
        const message = getInquiryErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDeleteInquiry(inquiryId: number) {
    const inquiry = this.selectedInquiry();
    const result = await this.dialogService.showDialog({
      title: 'Brisanje upita',
      message: `Da li sigurno želiš da obrišeš upit od „${inquiry?.firstName} ${inquiry?.lastName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.inquiryService.deleteInquiryMutation.mutate(inquiryId, {
      onSuccess: () => this.toastService.showSuccess(INQUIRY_TOAST_MESSAGES.deleteSuccess),
      onError: (err) => {
        const message = getInquiryErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDeleteCheckedInquiries() {
    const inquiryIds = this.checkedIds();
    if (!inquiryIds.length) return;

    const result = await this.dialogService.showDialog({
      title: 'Brisanje upita',
      message: `Da li sigurno želiš da obrišeš označene upite (${inquiryIds.length})?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.inquiryService.deleteInquiriesMutation.mutate(inquiryIds, {
      onSuccess: ({ deletedCount }) =>
        this.toastService.showSuccess(INQUIRY_TOAST_MESSAGES.bulkDeleteSuccess(deletedCount)),
      onError: (err) => {
        const message = getInquiryErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }
}
