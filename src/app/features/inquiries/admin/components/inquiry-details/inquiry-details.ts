import { Component, computed, input, output } from '@angular/core';
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
import { Button } from '@shared/components/button/button';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import {
  INQUIRY_STATUS_META,
  INQUIRY_TYPE_LABELS,
} from '@features/inquiries/utilities/inquiry-labels';

@Component({
  imports: [NgIcon, Button, SrDatePipe],
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
  styleUrl: './inquiry-details.css',
  templateUrl: './inquiry-details.html',
})
export class InquiryDetails {
  inquiry = input<InquiryItem>();
  isResolving = input<boolean>(false);
  isDeleting = input<boolean>(false);

  resolveInquiry = output<number>();
  deleteInquiry = output<number>();

  inquiryType = computed(() => {
    const inquiry = this.inquiry();
    return inquiry ? INQUIRY_TYPE_LABELS[inquiry.inquiryType] : '';
  });

  status = computed(() =>
    this.inquiry()?.isResolved ? INQUIRY_STATUS_META.resolved : INQUIRY_STATUS_META.unresolved,
  );

  onResolve(inquiryId: number) {
    this.resolveInquiry.emit(inquiryId);
  }

  onDelete(inquiryId: number) {
    this.deleteInquiry.emit(inquiryId);
  }
}
