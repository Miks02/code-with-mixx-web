import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
    Button,
    StudentSelection,
    ClassReservationListForm,
    ClassReservationPricing,
    ClassReservationSummary,
  ],
  providers: [ClassFormService, AdminClassReservationStore],
  selector: 'app-create-class-reservation-page',
  styleUrl: './create-class-reservation-page.css',
  templateUrl: './create-class-reservation-page.html',
})
export class CreateClassReservationPage {
  protected store = inject(AdminClassReservationStore);
}
