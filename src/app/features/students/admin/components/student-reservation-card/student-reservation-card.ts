import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidChalkboardUser,
  faSolidCoins,
  faSolidDiagramProject,
  faSolidMoneyBillWave,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import {
  PAYMENT_STATUS_META,
  RESERVATION_STATUS_META,
  ReservationStatus,
  ReservationType,
} from '@features/reservations';
import { PROJECT_TYPE_LABELS } from '@features/projects';
import { StudentReservation } from '@features/students/models/student-details';
import { Badge } from '@shared/components/badge/badge';

const BASE_CLASSES =
  'h-full p-4 rounded-lg flex flex-col gap-2.5 active:scale-95 transition-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-300';

const STATUS_BACKGROUNDS: Record<ReservationStatus, string> = {
  [ReservationStatus.Confirmed]: 'bg-emerald-900/80 hover:bg-emerald-800/80',
  [ReservationStatus.Completed]: 'bg-sky-700/30 hover:bg-sky-900/45',
  [ReservationStatus.Cancelled]: 'bg-red-700/30 hover:bg-red-900/45',
};

@Component({
  imports: [Badge, NgIcon, DatePipe, RouterLink],
  providers: [
    provideIcons({
      faSolidCalendarPlus,
      faSolidChalkboardUser,
      faSolidCoins,
      faSolidDiagramProject,
      faSolidMoneyBillWave,
    }),
  ],
  selector: 'app-student-reservation-card',
  templateUrl: './student-reservation-card.html',
})
export class StudentReservationCard {
  reservation = input.required<StudentReservation>();
  addOpacity = input<boolean>(false);

  isClass = computed(() => this.reservation().reservationType === ReservationType.Class);

  typeLabel = computed(() => (this.isClass() ? 'Časovi' : 'Projekti'));

  detailsLink = computed(() => [
    this.isClass() ? '/admin/classes/update' : '/admin/projects/update',
    this.reservation().id,
  ]);

  subjects = computed(() => {
    const reservation = this.reservation();
    if (this.isClass()) {
      return [...new Set(reservation.classes.map((c) => c.subjectName))].join(', ');
    }
    return reservation.projects
      .map((p) => `${p.subjectName} (${PROJECT_TYPE_LABELS[p.projectType]})`)
      .join(', ');
  });

  reservationStatus = computed(() => RESERVATION_STATUS_META[this.reservation().reservationStatus]);
  paymentStatus = computed(() => PAYMENT_STATUS_META[this.reservation().paymentStatus]);

  stats = computed(() => {
    const { classes, projects, totalPrice, paidAmount } = this.reservation();
    const countStat = this.isClass()
      ? { icon: 'faSolidChalkboardUser', label: 'Časovi', value: classes.length }
      : { icon: 'faSolidDiagramProject', label: 'Projekti', value: projects.length };

    return [
      countStat,
      { icon: 'faSolidCoins', label: 'Cena', value: priceConverter(totalPrice) },
      { icon: 'faSolidMoneyBillWave', label: 'Plaćeno', value: priceConverter(paidAmount) },
    ];
  });

  containerClasses = computed(
    () => `${BASE_CLASSES} ${STATUS_BACKGROUNDS[this.reservation().reservationStatus]}`,
  );
}
