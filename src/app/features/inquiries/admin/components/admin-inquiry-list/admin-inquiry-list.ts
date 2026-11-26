import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidListCheck,
  faSolidCircleCheck,
  faSolidLayerGroup,
  faSolidTrash,
} from '@ng-icons/font-awesome/solid';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { PagedList } from '@shared/components/paged-list/paged-list';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';
import { InquiryCard } from '@features/inquiries/components/inquiry-card/inquiry-card';
import { InquiryService } from '@features/inquiries/services/inquiry-service';
import { getInquiryErrorMessage } from '@features/inquiries/utilities/inquiry-error-messages';
import {
  CONFLICTING_INQUIRY_STATUS_FILTERS,
  INQUIRY_SORT_LABELS,
  INQUIRY_STATUS_FILTER_LABELS,
  INQUIRY_TYPE_FILTER_LABELS,
} from '@features/inquiries/utilities/inquiry-labels';
import { INQUIRY_TOAST_MESSAGES } from '@features/inquiries/utilities/inquiry-toast-messages';

@Component({
  imports: [
    InquiryCard,
    Button,
    FilterContainer,
    FilterMenu,
    SearchBar,
    SortMenu,
    NgIcon,
    PagedList,
  ],
  providers: [
    provideIcons({
      faSolidListCheck,
      faSolidCircleCheck,
      faSolidLayerGroup,
      faSolidTrash,
    }),
  ],
  selector: 'app-admin-inquiry-list',
  styleUrl: './admin-inquiry-list.css',
  templateUrl: './admin-inquiry-list.html',
})
export class AdminInquiryList {
  protected store = inject(AdminInquiryStore);
  private inquiryService = inject(InquiryService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  protected sortOptions = INQUIRY_SORT_LABELS;
  protected statusOptions = INQUIRY_STATUS_FILTER_LABELS;
  protected conflictingStatusOptions = CONFLICTING_INQUIRY_STATUS_FILTERS;
  protected typeOptions = INQUIRY_TYPE_FILTER_LABELS;

  protected selectAllClasses = computed(() => {
    const base =
      'shrink-0 self-center flex items-center justify-center gap-2 rounded-full p-2 border-2 bg-emerald-700 shadow-lg text-sm font-semibold text-emerald-100 cursor-pointer active:scale-95 transition-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 xl:rounded-lg xl:px-3 xl:py-1.5 xl:border xl:shadow-none';
    return this.store.areAllChecked()
      ? `${base} border-amber-500 xl:bg-emerald-700`
      : `${base} border-emerald-400 xl:border-emerald-200 xl:bg-transparent xl:hover:opacity-70`;
  });

  protected isChecked(inquiryId: number) {
    return this.store.checkedIds().includes(inquiryId);
  }

  async onDeleteChecked() {
    const inquiryIds = this.store.checkedIds();
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
