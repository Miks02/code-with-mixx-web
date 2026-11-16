import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCircleCheck,
  faSolidEnvelope,
  faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { AdminInquiryList } from '@features/inquiries/admin/components/admin-inquiry-list/admin-inquiry-list';
import { InquiryDetails } from '@features/inquiries/admin/components/inquiry-details/inquiry-details';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';

@Component({
  imports: [AdminInquiryList, InquiryDetails, StatsCard],
  providers: [
    AdminInquiryStore,
    provideIcons({ faSolidCircleCheck, faSolidEnvelope, faSolidHourglassHalf }),
  ],
  selector: 'app-inquiries-page',
  styleUrl: './inquiries-page.css',
  templateUrl: './inquiries-page.html',
})
export class InquiriesPage {
  protected store = inject(AdminInquiryStore);
}
