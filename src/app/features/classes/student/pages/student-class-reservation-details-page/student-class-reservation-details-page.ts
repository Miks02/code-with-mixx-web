import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft, faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';
import { ReservationPayments } from '@features/payments';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { ClassCard } from '@features/classes/components/class-card/class-card';
import { ClassReservationOverview } from '@features/classes/components/class-reservation-overview/class-reservation-overview';
import { StudentClassReservationDetailsStore } from '@features/classes/student/stores/student-class-reservation-details-store';

@Component({
  imports: [
    RouterLink,
    NgIcon,
    Button,
    Panel,
    Skeleton,
    ClassCard,
    ClassReservationOverview,
    ReservationPayments,
  ],
  providers: [
    StudentClassReservationDetailsStore,
    provideIcons({ faSolidArrowLeft, faSolidCalendarXmark }),
  ],
  selector: 'app-student-class-reservation-details-page',
  templateUrl: './student-class-reservation-details-page.html',
})
export class StudentClassReservationDetailsPage {
  protected store = inject(StudentClassReservationDetailsStore);

  protected skeletonCards = [0, 1, 2, 3];

  protected classesGridClasses = computed(() =>
    this.store.details()?.classes.length === 1
      ? 'grid grid-cols-1 gap-3'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  );
}
