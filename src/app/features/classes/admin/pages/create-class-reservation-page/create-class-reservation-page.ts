import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { StudentSelection } from '@features/students';
import { ReservationPricing, ReservationSummary } from '@features/reservations';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationListForm } from '@features/classes/admin/components/class-reservation-list-form/class-reservation-list-form';
import { AdminClassReservationStore } from '@features/classes/admin/stores/admin-class-reservation-store';

@Component({
  imports: [
    RouterLink,
    Button,
    StudentSelection,
    ClassReservationListForm,
    ReservationPricing,
    ReservationSummary,
  ],
  providers: [ClassFormService, AdminClassReservationStore],
  selector: 'app-create-class-reservation-page',
  templateUrl: './create-class-reservation-page.html',
})
export class CreateClassReservationPage {
  protected store = inject(AdminClassReservationStore);
  protected formService = inject(ClassFormService);
}
