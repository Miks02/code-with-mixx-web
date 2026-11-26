import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { dateConverter } from '@core/utilities/date-helpers';
import {
  ClassReservationItem,
  ClassReservationsSummary,
} from '@features/analytics/student/models/class-reservations-summary';
import { RESERVATION_STATUS_META } from '@features/reservations';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Panel } from '@shared/components/panel/panel';
import { faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { Slider } from '@shared/components/slider/slider';

@Component({
  imports: [Slider, NgIcon, RouterLink, Panel],
  providers: [provideIcons({ faSolidCalendarXmark })],
  selector: 'app-class-reservations',
  templateUrl: './class-reservations.html',
})
export class ClassReservations {
  summary = input.required<ClassReservationsSummary | undefined>();

  totalReservations = computed(() => this.summary()?.total ?? 0);
  totalHours = computed(() => (this.summary()?.totalHours ?? 0).toLocaleString('sr-Latn-RS'));
  reservations = computed(() => this.summary()?.classReservationItems ?? []);

  statusMeta(reservation: ClassReservationItem) {
    return RESERVATION_STATUS_META[reservation.reservationStatus];
  }

  reservedAt(reservation: ClassReservationItem) {
    return dateConverter(reservation.reservedAt);
  }
}
