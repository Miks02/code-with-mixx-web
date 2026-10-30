import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBoxArchive,
  faSolidChartDiagram,
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidMoneyBillTransfer,
  faSolidPlus,
  faSolidUserSlash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '@core/models/paged-result';
import { Button } from '@shared/components/button/button';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import {
  CONFLICTING_RESERVATION_STATUSES,
  PaymentStatus,
  RESERVATION_STATUS_FILTER_LABELS,
  ReservationStatus,
} from '@features/reservations';
import { SubjectLookupItem } from '@features/subjects';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassReservationCard } from '../class-reservation-card/class-reservation-card';
import { Router } from '@angular/router';

@Component({
  imports: [ClassReservationCard, Button, FilterMenu, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidBoxArchive,
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidPlus,
      faSolidUserSlash,
      faSolidXmark,
      faSolidBook,
      faSolidChartDiagram,
      faSolidMoneyBillTransfer,
    }),
  ],
  selector: 'app-class-reservations-list',
  styleUrl: './class-reservations-list.css',
  templateUrl: './class-reservations-list.html',
})
export class ClassReservationsList {
  pagedReservations = input.required<PagedResult<ClassReservationItem> | undefined>();
  selectedReservationId = input<number | undefined>(undefined);
  subjects = input<SubjectLookupItem[]>([]);
  selectedSubjectIds = input<number[]>([]);
  selectedReservationStatuses = input<ReservationStatus[]>([]);
  selectedPaymentStatuses = input<PaymentStatus[]>([]);
  showOnlyDeletedStudents = input<boolean>(false);
  showOnlyDeletedReservations = input<boolean>(false);
  isPending = input<boolean>(false);
  isFetching = input<boolean>(false);

  router = inject(Router);

  conflictingReservationStatuses = CONFLICTING_RESERVATION_STATUSES;

  reservationSelected = output<ClassReservationItem | undefined>();
  pageChanged = output<number>();
  subjectIdsChanged = output<number[]>();
  reservationStatusesChanged = output<ReservationStatus[]>();
  paymentStatusesChanged = output<PaymentStatus[]>();
  deletedReservationsToggled = output<boolean>();
  deletedStudentsToggled = output<boolean>();
  openCreationForm = output<void>();

  subjectOptions = computed<Record<string, string>>(() =>
    Object.fromEntries(this.subjects().map((subject) => [subject.id, subject.subjectName])),
  );
  selectedSubjectOptions = computed(() => this.selectedSubjectIds().map(String));

  reservations = computed(() => this.pagedReservations()?.items);
  skeletonItems = computed(() => Array.from({ length: 6 }));
  totalCount = computed(() => this.pagedReservations()?.totalCount ?? 0);
  paginatedCount = computed(() => this.pagedReservations()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedReservations()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedReservations()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedReservations()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedReservations()?.hasNextPage ?? false);

  reservationStatuses = RESERVATION_STATUS_FILTER_LABELS;

  paymentStatuses: Record<PaymentStatus, string> = {
    [PaymentStatus.Pending]: 'Na čekanju',
    [PaymentStatus.Paid]: 'Plaćeno',
    [PaymentStatus.PartiallyPaid]: 'Delimično plaćeno',
    [PaymentStatus.Overdue]: 'Kasni uplata',
    [PaymentStatus.Refunded]: 'Povraćen novac',
  };

  onReservationSelected(reservation: ClassReservationItem | undefined) {
    this.reservationSelected.emit(reservation);
  }

  onSubjectsChanged(subjectIds: string[]) {
    this.subjectIdsChanged.emit(subjectIds.map(Number));
  }

  onReservationStatusesChanged(reservationStatuses: ReservationStatus[]) {
    this.reservationStatusesChanged.emit(reservationStatuses);
  }

  onPaymentStatusesChanged(paymentStatuses: PaymentStatus[]) {
    this.paymentStatusesChanged.emit(paymentStatuses);
  }

  onDeletedReservationsToggle() {
    this.deletedReservationsToggled.emit(!this.showOnlyDeletedReservations());
  }

  onDeletedStudentsToggle() {
    this.deletedStudentsToggled.emit(!this.showOnlyDeletedStudents());
  }

  onOpenCreationForm() {
    this.router.navigate(['admin/classes/create']);
  }

  onPreviousPage() {
    if (!this.hasPreviousPage()) return;
    this.pageChanged.emit(this.currentPage() - 1);
  }

  onNextPage() {
    if (!this.hasNextPage()) return;
    this.pageChanged.emit(this.currentPage() + 1);
  }
}
