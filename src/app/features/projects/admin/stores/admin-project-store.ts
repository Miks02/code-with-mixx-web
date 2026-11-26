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
import { ProjectQueryParams } from '@features/projects/models/project-query-params';
import { ProjectReservationItem } from '@features/projects/models/project-reservation-item';
import { ProjectType } from '@features/projects/models/project-type';
import { ProjectService } from '@features/projects/services/project-service';

type AdminProjectState = {
  params: ProjectQueryParams;
  reservationModal: ReservationModalType | null;
  editedProjectId: number | null;
  detailsScrollRequests: number;
};

const initialState: AdminProjectState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    subjectIds: [],
    projectTypes: [],
    paymentStatuses: [],
    reservationStatuses: [],
    showOnlyDeletedReservations: false,
    showOnlyDeletedStudents: false,
  },
  reservationModal: null,
  editedProjectId: null,
  detailsScrollRequests: 0,
};

export const AdminProjectStore = signalStore(
  withState(initialState),
  withProps(
    (store, projectService = inject(ProjectService), subjectService = inject(SubjectService)) => {
      const summaryQuery = projectService.getProjectsSummaryQuery(store.params);

      return {
        summaryQuery,
        reservationsQuery: projectService.getPagedProjectReservationsQuery(
          store.params,
          summaryQuery,
        ),
        subjectsLookupQuery: subjectService.getSubjectsLookupQuery(),
        _archiveMutation: projectService.archiveProjectReservationMutation,
        _restoreMutation: projectService.restoreProjectReservationMutation,
        _deleteMutation: projectService.deleteProjectReservationMutation,
        _updateProjectMutation: projectService.updateProjectMutation,
      };
    },
  ),
  withLinkedState((store) => ({
    selectedReservation: linkedSignal<ProjectReservationItem[], ProjectReservationItem | undefined>(
      {
        source: () => store.reservationsQuery.data()?.items ?? [],
        computation: (reservations, previous) =>
          reservations.find((reservation) => reservation.id === previous?.value?.id) ??
          reservations[0],
      },
    ),
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
    isUpdatingProject: computed(() => store._updateProjectMutation.isPending()),
    paymentHistory: computed(() => store.paymentHistoryQuery.data()),
    isPaymentHistoryLoading: computed(() => store.paymentHistoryQuery.isLoading()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<ProjectQueryParams>) =>
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
        const page = store.reservationsQuery.data();
        if (!page?.hasPreviousPage) return;
        patchParams({ pageNumber: page.pageNumber - 1 });
      },
      nextPage() {
        const page = store.reservationsQuery.data();
        if (!page?.hasNextPage) return;
        patchParams({ pageNumber: page.pageNumber + 1 });
      },
      selectReservation(reservation: ProjectReservationItem | undefined) {
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
      openProjectModal(projectId: number) {
        patchState(store, { editedProjectId: projectId });
      },
      closeProjectModal() {
        patchState(store, { editedProjectId: null });
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
