import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { PagedResult } from '@core/models/paged-result';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { SubjectService } from '@features/subjects';
import { ClassReservationsList } from '@features/classes/admin/components/class-reservations-list/class-reservations-list';
import { ClassQueryParams } from '@features/classes/models/class-query-params';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassReservationSortBy } from '@features/classes/models/class-reservation-sort-by';

@Component({
  imports: [ClassReservationsList],
  selector: 'app-classes-page',
  styleUrl: './classes-page.css',
  templateUrl: './classes-page.html',
})
export class ClassesPage {
  private subjectService = inject(SubjectService);

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

  private subjectsLookupSource = this.subjectService.getSubjectsLookupQuery();

  subjectsLookupData = computed(() => this.subjectsLookupSource.data() ?? []);

  // TODO: replace with ClassService query driven by queryParams
  reservationsData = signal<PagedResult<ClassReservationItem> | undefined>(undefined);
  reservationsPending = signal(false);
  reservationsFetching = signal(false);

  selectedReservation = linkedSignal<ClassReservationItem[], ClassReservationItem | undefined>({
    source: () => this.reservationsData()?.items ?? [],
    computation: (options, previous) =>
      options.find((o) => o.id === previous?.value?.id) ?? options[0],
  });

  onReservationSelected(reservation: ClassReservationItem | undefined) {
    this.selectedReservation.set(reservation);
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
