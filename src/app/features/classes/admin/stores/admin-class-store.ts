import { computed, effect, inject, linkedSignal, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withLinkedState,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { PaymentService } from '@features/payments';
import { PaymentStatus, ReservationModalType, ReservationStatus } from '@features/reservations';
import { SubjectService } from '@features/subjects';
import { ClassQueryParams } from '@features/classes/models/class-query-params';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import { ClassReservationSortBy } from '@features/classes/models/class-reservation-sort-by';
import { ClassService } from '@features/classes/services/class-service';

type AdminClassState = {
  params: ClassQueryParams;
  reservationModal: ReservationModalType | null;
  detailsScrollRequests: number;
};

const initialState: AdminClassState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    subjectIds: [],
    paymentStatuses: [],
    reservationStatuses: [],
    sortBy: ClassReservationSortBy.StartDateAscending,
    showOnlyDeletedReservations: false,
    showOnlyDeletedStudents: false,
  },
  reservationModal: null,
  detailsScrollRequests: 0,
};

export const AdminClassStore = signalStore(
  withState(initialState),
  withProps(
    (store, classService = inject(ClassService), subjectService = inject(SubjectService)) => {
      const summaryQuery = classService.getClassesSummaryQuery(store.params);

      return {
        summaryQuery,
        reservationsQuery: classService.getPagedClassReservationsQuery(store.params, summaryQuery),
        subjectsLookupQuery: subjectService.getSubjectsLookupQuery(),
        _archiveMutation: classService.archiveClassReservationMutation,
        _restoreMutation: classService.restoreClassReservationMutation,
        _deleteMutation: classService.deleteClassReservationMutation,
      };
    },
  ),
  withLinkedState((store) => ({
    selectedReservation: linkedSignal<ClassReservationItem[], ClassReservationItem | undefined>({
      source: () => store.reservationsQuery.data()?.items ?? [],
      computation: (reservations, previous) =>
        reservations.find((reservation) => reservation.id === previous?.value?.id) ??
        reservations[0],
    }),
  })),
  withProps((store, paymentService = inject(PaymentService)) => ({
    paymentHistoryQuery: paymentService.getPaymentHistoryForReservationQuery(
      computed(() => store.selectedReservation()?.id ?? 0),
      computed(() => store.reservationModal() === 'payment-history'),
    ),
  })),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    reservations: computed(() => store.reservationsQuery.data()?.items ?? []),
    pagedCount: computed(() => store.reservationsQuery.data()?.paginatedCount ?? 0),
    totalCount: computed(() => store.reservationsQuery.data()?.totalCount ?? 0),
    currentPage: computed(() => store.reservationsQuery.data()?.pageNumber ?? 1),
    totalPages: computed(() => store.reservationsQuery.data()?.totalPages ?? 1),
    hasPreviousPage: computed(() => store.reservationsQuery.data()?.hasPreviousPage ?? false),
    hasNextPage: computed(() => store.reservationsQuery.data()?.hasNextPage ?? false),
    reservationsPending: computed(() => store.reservationsQuery.isPending()),
    reservationsFetching: computed(() => store.reservationsQuery.isFetching()),
    subjects: computed(() => store.subjectsLookupQuery.data() ?? []),
    selectedReservationId: computed(() => store.selectedReservation()?.id),
    isArchiving: computed(
      () =>
        store._archiveMutation.isPending() ||
        store._restoreMutation.isPending() ||
        store._deleteMutation.isPending(),
    ),
    paymentHistory: computed(() => store.paymentHistoryQuery.data()),
    isPaymentHistoryLoading: computed(() => store.paymentHistoryQuery.isLoading()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<ClassQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setSubjectIds(subjectIds: number[]) {
        patchParams({ subjectIds, pageNumber: 1 });
      },
      setReservationStatuses(reservationStatuses: ReservationStatus[]) {
        patchParams({ reservationStatuses, pageNumber: 1 });
      },
      setPaymentStatuses(paymentStatuses: PaymentStatus[]) {
        patchParams({ paymentStatuses, pageNumber: 1 });
      },
      toggleDeletedReservations() {
        patchParams({
          showOnlyDeletedReservations: !store.params.showOnlyDeletedReservations(),
          pageNumber: 1,
        });
      },
      toggleDeletedStudents() {
        patchParams({
          showOnlyDeletedStudents: !store.params.showOnlyDeletedStudents(),
          pageNumber: 1,
        });
      },
      previousPage() {
        if (!store.hasPreviousPage()) return;
        patchParams({ pageNumber: store.currentPage() - 1 });
      },
      nextPage() {
        if (!store.hasNextPage()) return;
        patchParams({ pageNumber: store.currentPage() + 1 });
      },
      selectReservation(reservation: ClassReservationItem | undefined) {
        patchState(store, {
          selectedReservation: reservation,
          detailsScrollRequests: reservation
            ? store.detailsScrollRequests() + 1
            : store.detailsScrollRequests(),
        });
      },
      openModal(reservationModal: ReservationModalType) {
        patchState(store, { reservationModal });
      },
      closeModal() {
        patchState(store, { reservationModal: null });
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect(() => {
        const paged = store.reservationsQuery.data();
        if (!paged || paged.items.length > 0 || paged.pageNumber <= 1) return;

        const lastPage = Math.max(1, paged.totalPages);
        untracked(() => patchState(store, { params: { ...store.params(), pageNumber: lastPage } }));
      });
    },
  }),
);
