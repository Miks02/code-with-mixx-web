import { computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  ReservationTypeFilter,
  StudentDetailsQueryParams,
} from '@features/students/models/student-details';
import { StudentService } from '@features/students/services/student-service';

type AdminStudentDetailsState = {
  studentId: string;
  params: StudentDetailsQueryParams;
};

export const AdminStudentDetailsStore = signalStore(
  withState<AdminStudentDetailsState>(() => ({
    studentId: inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '',
    params: {
      pageNumber: 1,
      pageSize: 10,
      reservationType: null,
    },
  })),
  withProps((store, studentService = inject(StudentService)) => ({
    detailsQuery: studentService.getStudentDetailsQuery(store.studentId, store.params),
  })),
  withComputed((store) => ({
    student: computed(() => store.detailsQuery.data()?.student),
    stats: computed(() => store.detailsQuery.data()?.stats),
    reservations: computed(() => store.detailsQuery.data()?.reservations.items ?? []),
    pagedCount: computed(() => store.detailsQuery.data()?.reservations.paginatedCount ?? 0),
    totalCount: computed(() => store.detailsQuery.data()?.reservations.totalCount ?? 0),
    currentPage: computed(() => store.detailsQuery.data()?.reservations.pageNumber ?? 1),
    totalPages: computed(() =>
      Math.max(store.detailsQuery.data()?.reservations.totalPages ?? 1, 1),
    ),
    hasPreviousPage: computed(
      () => store.detailsQuery.data()?.reservations.hasPreviousPage ?? false,
    ),
    hasNextPage: computed(() => store.detailsQuery.data()?.reservations.hasNextPage ?? false),
    detailsPending: computed(() => store.detailsQuery.isPending()),
    detailsFetching: computed(() => store.detailsQuery.isFetching()),
    isNotFound: computed(() => store.detailsQuery.error()?.errorCode === 'Student.NotFound'),
    selectedReservationType: computed<ReservationTypeFilter>(
      () => store.params.reservationType() ?? 'All',
    ),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<StudentDetailsQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setReservationType(type: ReservationTypeFilter) {
        patchParams({ reservationType: type === 'All' ? null : type, pageNumber: 1 });
      },
      previousPage() {
        if (!store.hasPreviousPage()) return;
        patchParams({ pageNumber: store.currentPage() - 1 });
      },
      nextPage() {
        if (!store.hasNextPage()) return;
        patchParams({ pageNumber: store.currentPage() + 1 });
      },
    };
  }),
);
