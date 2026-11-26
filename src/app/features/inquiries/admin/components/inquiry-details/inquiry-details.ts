import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidCircleCheck,
  faSolidEnvelope,
  faSolidHandPointer,
  faSolidLayerGroup,
  faSolidPhone,
  faSolidTrash,
  faSolidUserCheck,
} from '@ng-icons/font-awesome/solid';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';
import { InquiryService } from '@features/inquiries/services/inquiry-service';
import { getInquiryErrorMessage } from '@features/inquiries/utilities/inquiry-error-messages';
import {
  INQUIRY_STATUS_META,
  INQUIRY_TYPE_LABELS,
} from '@features/inquiries/utilities/inquiry-labels';
import { INQUIRY_TOAST_MESSAGES } from '@features/inquiries/utilities/inquiry-toast-messages';

@Component({
  imports: [NgIcon, Button, Panel, SrDatePipe],
  providers: [
    provideIcons({
      faSolidCalendarPlus,
      faSolidCircleCheck,
      faSolidEnvelope,
      faSolidHandPointer,
      faSolidLayerGroup,
      faSolidPhone,
      faSolidTrash,
      faSolidUserCheck,
    }),
  ],
  selector: 'app-inquiry-details',
  templateUrl: './inquiry-details.html',
})
export class InquiryDetails {
  protected store = inject(AdminInquiryStore);
  private inquiryService = inject(InquiryService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  inquiry = this.store.selectedInquiry;

  inquiryType = computed(() => {
    const inquiry = this.inquiry();
    return inquiry ? INQUIRY_TYPE_LABELS[inquiry.inquiryType] : '';
  });

  panelTitle = computed(() => {
    const inquiry = this.inquiry();
    return inquiry ? `${inquiry.firstName} ${inquiry.lastName}` : 'Detalji upita';
  });

  status = computed(() =>
    this.inquiry()?.isResolved ? INQUIRY_STATUS_META.resolved : INQUIRY_STATUS_META.unresolved,
  );

  onResolve(inquiryId: number) {
    this.inquiryService.resolveInquiryMutation.mutate(inquiryId, {
      onSuccess: () => this.toastService.showSuccess(INQUIRY_TOAST_MESSAGES.resolveSuccess),
      onError: (err) => {
        const message = getInquiryErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDelete(inquiryId: number) {
    const inquiry = this.inquiry();
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
}
