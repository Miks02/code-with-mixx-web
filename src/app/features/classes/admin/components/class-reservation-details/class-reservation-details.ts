import { Component, computed, inject, input, output, signal, WritableSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowsRotate,
  faSolidBoxArchive,
  faSolidCalendarXmark,
  faSolidCircleMinus,
  faSolidCirclePlus,
  faSolidCoins,
  faSolidEye,
  faSolidGift,
  faSolidHandPointer,
  faSolidHourglassHalf,
  faSolidMoneyBill1,
  faSolidMoneyBillWave,
  faSolidPercent,
  faSolidTrash,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { PAYMENT_STATUS_META, RESERVATION_STATUS_META, StatusMeta } from '@features/reservations';
import { Router } from '@angular/router';
import { ReservationModalType, UpdateStatusModal } from '@features/reservations';
import {
  PaymentService,
  RegisterPaymentModal,
  ReservationPaymentHistoryModal,
  SubtractPaymentModal,
} from '@features/payments';
import { ClassCard } from '@features/classes/components/class-card/class-card';

type ReservationStat = {
  icon: string;
  value: string;
  label: string;
};

@Component({
  imports: [
    NgIcon,
    Button,
    RegisterPaymentModal,
    ReservationPaymentHistoryModal,
    SubtractPaymentModal,
    UpdateStatusModal,
    SrDatePipe,
    ClassCard
  ],
  providers: [
    provideIcons({
      faSolidArrowsRotate,
      faSolidBoxArchive,
      faSolidCalendarXmark,
      faSolidCircleMinus,
      faSolidCirclePlus,
      faSolidCoins,
      faSolidEye,
      faSolidGift,
      faSolidHandPointer,
      faSolidHourglassHalf,
      faSolidMoneyBillWave,
      faSolidPercent,
      faSolidMoneyBill1,
      faSolidTrash,
    }),
  ],
  selector: 'app-class-reservation-details',
  styleUrl: './class-reservation-details.css',
  templateUrl: './class-reservation-details.html',
})
export class ClassReservationDetails {
  reservation = input<ClassReservationItem>();
  isArchiving = input<boolean>(false);
  archiveReservation = output<number>();
  restoreReservation = output<number>();
  deleteReservation = output<number>();

  private router = inject(Router);
  private paymentService = inject(PaymentService);

  reservationModal: WritableSignal<ReservationModalType | null> = signal(null);

  isReservationModalVisible = computed(() => this.reservationModal() !== null);

  private reservationId = computed(() => this.reservation()?.id ?? 0);
  private paymentHistoryQuery = this.paymentService.getPaymentHistoryForReservationQuery(
    this.reservationId,
    computed(() => this.reservationModal() === 'payment-history'),
  );
  paymentHistory = computed(() => this.paymentHistoryQuery.data());
  isPaymentHistoryLoading = this.paymentHistoryQuery.isLoading;

  reservationStatus = computed<StatusMeta | null>(() => {
    const reservation = this.reservation();
    return reservation ? RESERVATION_STATUS_META[reservation.reservationStatus] : null;
  });

  paymentStatus = computed<StatusMeta | null>(() => {
    const reservation = this.reservation();
    return reservation ? PAYMENT_STATUS_META[reservation.paymentStatus] : null;
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
    return this.router.navigate([`admin/classes/details/${reservationId}`]);
  }

  onArchive(reservationId: number) {
    this.archiveReservation.emit(reservationId);
  }

  onRestore(reservationId: number) {
    this.restoreReservation.emit(reservationId);
  }

  onDelete(reservationId: number) {
    this.deleteReservation.emit(reservationId);
  }

  openModal(type: ReservationModalType) {
    this.reservationModal.set(type);
  }

  closeModal() {
    this.reservationModal.set(null);
  }
}
