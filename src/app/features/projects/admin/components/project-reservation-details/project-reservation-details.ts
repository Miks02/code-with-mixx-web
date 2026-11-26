import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { priceConverter } from '@core/utilities/price-helpers';
import {
  RegisterPaymentModal,
  ReservationPaymentHistoryModal,
  SubtractPaymentModal,
} from '@features/payments';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import { ProjectCard } from '@features/projects/components/project-card/project-card';
import { ProjectService } from '@features/projects/services/project-service';
import { getProjectReservationErrorMessage } from '@features/projects/utilities/project-error-messages';
import { PROJECT_RESERVATION_TOAST_MESSAGES } from '@features/projects/utilities/project-toast-messages';
import {
  PAYMENT_STATUS_META,
  RESERVATION_STATUS_META,
  StatusMeta,
  UpdateStatusModal,
} from '@features/reservations';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowsRotate,
  faSolidBoxArchive,
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
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Panel } from '@shared/components/panel/panel';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { ProjectEditModal } from '../project-edit-modal/project-edit-modal';

type ReservationStat = {
  icon: string;
  value: string;
  label: string;
};

@Component({
  imports: [
    NgIcon,
    Button,
    Panel,
    EmptyState,
    ProjectCard,
    ProjectEditModal,
    RegisterPaymentModal,
    ReservationPaymentHistoryModal,
    SubtractPaymentModal,
    UpdateStatusModal,
    SrDatePipe,
  ],
  providers: [
    provideIcons({
      faSolidArrowsRotate,
      faSolidBoxArchive,
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
  selector: 'app-project-reservation-details',
  styleUrl: './project-reservation-details.css',
  templateUrl: './project-reservation-details.html',
})
export class ProjectReservationDetails {
  protected store = inject(AdminProjectStore);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  reservation = this.store.selectedReservation;

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
    return this.router.navigate([`admin/projects/details/${reservationId}`]);
  }

  async onArchive(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Arhiviranje rezervacije',
      message: `Da li sigurno želiš da arhiviraš rezervaciju studenta „${this.reservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.archiveProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(PROJECT_RESERVATION_TOAST_MESSAGES.archiveSuccess),
      onError: (err) => {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onRestore(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Vraćanje rezervacije',
      message: `Da li sigurno želiš da vratiš rezervaciju studenta „${this.reservation()?.studentFullName}” iz arhive?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.restoreProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(PROJECT_RESERVATION_TOAST_MESSAGES.restoreSuccess),
      onError: (err) => {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDelete(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Brisanje rezervacije',
      message: `Da li sigurno želiš da obrišeš rezervaciju studenta „${this.reservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.deleteProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(PROJECT_RESERVATION_TOAST_MESSAGES.deleteSuccess),
      onError: (err) => {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }
}
