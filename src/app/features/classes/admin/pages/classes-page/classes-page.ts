import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidCalendarXmark,
  faSolidChalkboardUser,
  faSolidCircleCheck,
} from '@ng-icons/font-awesome/solid';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { SubjectService } from '@features/subjects';
import { ClassReservationDetails } from '@features/classes/admin/components/class-reservation-details/class-reservation-details';
import { NextClassCard } from '@features/classes/admin/components/next-class-card/next-class-card';
import { ClassReservationsList } from '@features/classes/admin/components/class-reservations-list/class-reservations-list';
import { ClassQueryParams } from '@features/classes/models/class-query-params';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassReservationSortBy } from '@features/classes/models/class-reservation-sort-by';
import { ClassService } from '@features/classes/services/class-service';
import { getClassReservationErrorMessage } from '@features/classes/utilities/class-error-messages';
import { CLASS_RESERVATION_TOAST_MESSAGES } from '@features/classes/utilities/class-toast-messages';

@Component({
  imports: [ClassReservationsList, ClassReservationDetails, NextClassCard, StatsCard],
  providers: [
    provideIcons({
      faSolidCalendarCheck,
      faSolidCalendarXmark,
      faSolidChalkboardUser,
      faSolidCircleCheck,
    }),
  ],
  selector: 'app-classes-page',
  styleUrl: './classes-page.css',
  templateUrl: './classes-page.html',
})
export class ClassesPage {
  private classService = inject(ClassService);
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);

  protected queryParams = signal<ClassQueryParams>({
    pageNumber: 1,
    pageSize: 15,
    subjectIds: [],
    paymentStatuses: [],
    reservationStatuses: [],
    sortBy: ClassReservationSortBy.StartDateAscending,
    showOnlyDeletedReservations: false,
    showOnlyDeletedStudents: false,
  });

  private classesSummarySource = this.classService.getClassesSummaryQuery(this.queryParams);
  private reservationsSource = this.classService.getPagedClassReservationsQuery(
    this.queryParams,
    this.classesSummarySource,
  );

  private subjectsLookupSource = this.subjectService.getSubjectsLookupQuery();

  subjectsLookupData = computed(() => this.subjectsLookupSource.data() ?? []);
  classesSummaryData = computed(() => this.classesSummarySource.data());
  reservationsData = computed(() => this.reservationsSource.data());

  classesSummaryPending = computed(() => this.classesSummarySource.isPending());
  reservationsPending = computed(() => this.reservationsSource.isPending());
  reservationsFetching = computed(() => this.reservationsSource.isFetching());
  isArchiving = computed(
    () =>
      this.classService.archiveClassReservationMutation.isPending() ||
      this.classService.restoreClassReservationMutation.isPending() ||
      this.classService.deleteClassReservationMutation.isPending(),
  );

  selectedReservation = linkedSignal<ClassReservationItem[], ClassReservationItem | undefined>({
    source: () => this.reservationsData()?.items ?? [],
    computation: (options, previous) =>
      options.find((o) => o.id === previous?.value?.id) ?? options[0],
  });

  onReservationSelected(reservation: ClassReservationItem | undefined) {
    this.selectedReservation.set(reservation);
  }

  async onArchiveReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Arhiviranje rezervacije',
      message: `Da li sigurno želiš da arhiviraš rezervaciju studenta „${this.selectedReservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.classService.archiveClassReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(CLASS_RESERVATION_TOAST_MESSAGES.archiveSuccess),
      onError: (err) => {
        const message = getClassReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onRestoreReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Vraćanje rezervacije',
      message: `Da li sigurno želiš da vratiš rezervaciju studenta „${this.selectedReservation()?.studentFullName}” iz arhive?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.classService.restoreClassReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(CLASS_RESERVATION_TOAST_MESSAGES.restoreSuccess),
      onError: (err) => {
        const message = getClassReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDeleteReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Brisanje rezervacije',
      message: `Da li sigurno želiš da obrišeš rezervaciju studenta „${this.selectedReservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.classService.deleteClassReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(CLASS_RESERVATION_TOAST_MESSAGES.deleteSuccess),
      onError: (err) => {
        const message = getClassReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  onSubjectIdsChange(subjectIds: number[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, subjectIds }));
  }

  onReservationStatusesChange(reservationStatuses: ReservationStatus[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, reservationStatuses }));
  }

  onPaymentStatusesChange(paymentStatuses: PaymentStatus[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, paymentStatuses }));
  }

  onDeletedReservationsToggle(showOnlyDeletedReservations: boolean) {
    this.queryParams.update((params) => ({
      ...params,
      pageNumber: 1,
      showOnlyDeletedReservations,
    }));
  }

  onDeletedStudentsToggle(showOnlyDeletedStudents: boolean) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, showOnlyDeletedStudents }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }
}
