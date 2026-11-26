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
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { SubjectService } from '@features/subjects';
import { ProjectType } from '@features/projects/models/project-type';
import { ProjectService } from '@features/projects/services/project-service';
import {
  StudentProjectQueryParams,
  StudentProjectReservationItem,
} from '@features/projects/student/models/student-project-reservation-item';

type StudentProjectState = {
  params: StudentProjectQueryParams;
  isPaymentHistoryOpen: boolean;
  detailsScrollRequests: number;
};

const initialState: StudentProjectState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    subjectIds: [],
    projectTypes: [],
    paymentStatuses: [],
    reservationStatuses: [],
  },
  isPaymentHistoryOpen: false,
  detailsScrollRequests: 0,
};

export const StudentProjectStore = signalStore(
  withState(initialState),
  withProps(
    (store, projectService = inject(ProjectService), subjectService = inject(SubjectService)) => {
      const summaryQuery = projectService.getStudentProjectsSummaryQuery(store.params);

      return {
        summaryQuery,
        reservationsQuery: projectService.getStudentPagedProjectReservationsQuery(
          store.params,
          summaryQuery,
        ),
        subjectsLookupQuery: subjectService.getSubjectsLookupQuery(),
      };
    },
  ),
  withLinkedState((store) => ({
    selectedReservation: linkedSignal<
      StudentProjectReservationItem[],
      StudentProjectReservationItem | undefined
    >({
      source: () => store.reservationsQuery.data()?.items ?? [],
      computation: (reservations, previous) =>
        reservations.find((reservation) => reservation.id === previous?.value?.id) ??
        reservations[0],
    }),
  })),
  withProps((store, paymentService = inject(PaymentService)) => ({
    paymentHistoryQuery: paymentService.getStudentPaymentHistoryForReservationQuery(
      computed(() => store.selectedReservation()?.id ?? 0),
      store.isPaymentHistoryOpen,
    ),
  })),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    reservations: computed(() => store.reservationsQuery.data()?.items ?? []),
    reservationsPending: computed(() => store.reservationsQuery.isPending()),
    reservationsFetching: computed(() => store.reservationsQuery.isFetching()),
    subjects: computed(() => store.subjectsLookupQuery.data() ?? []),
    selectedReservationId: computed(() => store.selectedReservation()?.id),
    paymentHistory: computed(() => store.paymentHistoryQuery.data()),
    isPaymentHistoryLoading: computed(() => store.paymentHistoryQuery.isLoading()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<StudentProjectQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setSubjectIds(subjectIds: number[]) {
        patchParams({ subjectIds, pageNumber: 1 });
      },
      setProjectTypes(projectTypes: ProjectType[]) {
        patchParams({ projectTypes, pageNumber: 1 });
      },
      setReservationStatuses(reservationStatuses: ReservationStatus[]) {
        patchParams({ reservationStatuses, pageNumber: 1 });
      },
      setPaymentStatuses(paymentStatuses: PaymentStatus[]) {
        patchParams({ paymentStatuses, pageNumber: 1 });
      },
      previousPage() {
        const page = store.reservationsQuery.data();
        if (!page?.hasPreviousPage) return;
        patchParams({ pageNumber: page.pageNumber - 1 });
      },
      nextPage() {
        const page = store.reservationsQuery.data();
        if (!page?.hasNextPage) return;
        patchParams({ pageNumber: page.pageNumber + 1 });
      },
      selectReservation(reservation: StudentProjectReservationItem | undefined) {
        patchState(store, {
          selectedReservation: reservation,
          detailsScrollRequests: reservation
            ? store.detailsScrollRequests() + 1
            : store.detailsScrollRequests(),
        });
      },
      openPaymentHistory() {
        patchState(store, { isPaymentHistoryOpen: true });
      },
      closePaymentHistory() {
        patchState(store, { isPaymentHistoryOpen: false });
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
