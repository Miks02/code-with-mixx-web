import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { StudentSelection } from '@features/students';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationListForm } from '@features/classes/admin/components/class-reservation-list-form/class-reservation-list-form';
import { ClassReservationPricing } from '@features/classes/admin/components/class-reservation-pricing/class-reservation-pricing';
import { ClassReservationSummary } from '@features/classes/admin/components/class-reservation-summary/class-reservation-summary';
import { AdminClassReservationStore } from '@features/classes/admin/stores/admin-class-reservation-store';

@Component({
  imports: [
    RouterLink,
    NgIcon,
    Button,
    StudentSelection,
    ClassReservationListForm,
    ClassReservationPricing,
    ClassReservationSummary,
  ],
  providers: [ClassFormService, AdminClassReservationStore, provideIcons({ faSolidCalendarXmark })],
  selector: 'app-class-reservation-details-page',
  styleUrl: './class-reservation-details-page.css',
  templateUrl: './class-reservation-details-page.html',
})
export class ClassReservationDetailsPage {
  protected store = inject(AdminClassReservationStore);
}
