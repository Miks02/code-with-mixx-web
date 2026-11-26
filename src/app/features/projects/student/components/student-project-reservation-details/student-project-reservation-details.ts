import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCoins,
  faSolidEye,
  faSolidGift,
  faSolidHandPointer,
  faSolidHourglassHalf,
  faSolidMoneyBill1,
  faSolidMoneyBillWave,
  faSolidPercent,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { ReservationPaymentHistoryModal } from '@features/payments';
import { PAYMENT_STATUS_META, RESERVATION_STATUS_META } from '@features/reservations';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Panel } from '@shared/components/panel/panel';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { ProjectCard } from '@features/projects/components/project-card/project-card';
import { StudentProjectStore } from '@features/projects/student/stores/student-project-store';

type ReservationStat = { icon: string; value: string; label: string };

@Component({
  imports: [
    Badge,
    Button,
    EmptyState,
    NgIcon,
    Panel,
    ProjectCard,
    ReservationPaymentHistoryModal,
    SrDatePipe,
  ],
  providers: [
    provideIcons({
      faSolidCoins,
      faSolidEye,
      faSolidGift,
      faSolidHandPointer,
      faSolidHourglassHalf,
      faSolidMoneyBill1,
      faSolidMoneyBillWave,
      faSolidPercent,
    }),
  ],
  selector: 'app-student-project-reservation-details',
  templateUrl: './student-project-reservation-details.html',
})
export class StudentProjectReservationDetails {
  protected store = inject(StudentProjectStore);
  private router = inject(Router);

  protected reservation = computed(() => this.store.selectedReservation());

  protected title = computed(() => {
    const reservation = this.reservation();
    return reservation ? `Rezervacija #${reservation.id}` : 'Detalji rezervacije';
  });

  protected reservationStatus = computed(() => {
    const reservation = this.reservation();
    return reservation ? RESERVATION_STATUS_META[reservation.reservationStatus] : null;
  });

  protected paymentStatus = computed(() => {
    const reservation = this.reservation();
    return reservation ? PAYMENT_STATUS_META[reservation.paymentStatus] : null;
  });

  protected stats = computed<ReservationStat[]>(() => {
    const reservation = this.reservation();
    if (!reservation) return [];

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
    return this.router.navigate([`student/projects/details/${reservationId}`]);
  }
}
