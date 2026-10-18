import { Component, computed, inject, input, signal, WritableSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowsRotate,
  faSolidCircleMinus,
  faSolidCirclePlus,
  faSolidCoins,
  faSolidEye,
  faSolidGift,
  faSolidHandPointer,
  faSolidHourglassHalf,
  faSolidMoneyBillWave,
  faSolidPercent,
  faSolidTag,
} from '@ng-icons/font-awesome/solid';
import { dateConverter } from '../../../../../core/utilities/date-helpers';
import { priceConverter } from '../../../../../core/utilities/price-helpers';
import { Button } from '../../../../../shared/button/button';
import { ProjectCard } from '../../../components/project-card/project-card';
import { ProjectReservationItem } from '../../../models/project-reservation-item';
import {
  PAYMENT_STATUS_META,
  RESERVATION_STATUS_META,
  StatusMeta,
} from '../../../utilities/project-labels';
import { Router } from '@angular/router';
import { RegisterPaymentModal, ReservationModalType } from '../../../../reservations';

type ReservationStat = {
  icon: string;
  value: string;
  label: string;
};

@Component({
  imports: [NgIcon, Button, ProjectCard, RegisterPaymentModal],
  providers: [
    provideIcons({
      faSolidArrowsRotate,
      faSolidCircleMinus,
      faSolidCirclePlus,
      faSolidCoins,
      faSolidEye,
      faSolidGift,
      faSolidHandPointer,
      faSolidHourglassHalf,
      faSolidMoneyBillWave,
      faSolidPercent,
      faSolidTag,
    }),
  ],
  selector: 'app-project-reservation-details',
  styleUrl: './project-reservation-details.css',
  templateUrl: './project-reservation-details.html',
})
export class ProjectReservationDetails {
  reservation = input<ProjectReservationItem>();

  private router = inject(Router);

  reservationModal: WritableSignal<ReservationModalType | null> = signal(null);

  isReservationModalVisible = computed(() => this.reservationModal() !== null);

  reservationStatus = computed<StatusMeta | null>(() => {
    const reservation = this.reservation();
    return reservation ? RESERVATION_STATUS_META[reservation.reservationStatus] : null;
  });

  paymentStatus = computed<StatusMeta | null>(() => {
    const reservation = this.reservation();
    return reservation ? PAYMENT_STATUS_META[reservation.paymentStatus] : null;
  });

  createdAtLabel = computed(() => {
    const reservation = this.reservation();
    return reservation ? dateConverter(reservation.createdAt) : '';
  });

  stats = computed<ReservationStat[]>(() => {
    const reservation = this.reservation();
    if (!reservation) {
      return [];
    }

    const remaining = Math.max(0, reservation.totalPrice - reservation.paidAmount);

    return [
      { icon: 'faSolidCoins', value: priceConverter(reservation.totalPrice), label: 'Ukupna cena' },
      {
        icon: 'faSolidMoneyBillWave',
        value: priceConverter(reservation.paidAmount),
        label: 'Plaćeno',
      },
      { icon: 'faSolidHourglassHalf', value: priceConverter(remaining), label: 'Preostalo' },
      { icon: 'faSolidPercent', value: `${reservation.discountRate}%`, label: 'Popust' },
      { icon: 'faSolidGift', value: priceConverter(reservation.bonus), label: 'Bonus' },
    ];
  });

  goToDetails(reservationId: number) {
    return this.router.navigate([`admin/projects/details/${reservationId}`])
  }

  openModal(type: ReservationModalType) {
    this.reservationModal.set(type);
  }

  closeModal() {
    this.reservationModal.set(null);
  }
}
