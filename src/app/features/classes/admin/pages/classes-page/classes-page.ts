import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidCalendarXmark,
  faSolidChalkboardUser,
  faSolidCircleCheck,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { SubjectService } from '@features/subjects';
import { NextClassCard } from '@features/classes/admin/components/next-class-card/next-class-card';
import { ClassReservationsList } from '@features/classes/admin/components/class-reservations-list/class-reservations-list';
import { ClassQueryParams } from '@features/classes/models/class-query-params';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassReservationSortBy } from '@features/classes/models/class-reservation-sort-by';
import { ClassService } from '@features/classes/services/class-service';

@Component({
  imports: [ClassReservationsList, NextClassCard, StatsCard],
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
