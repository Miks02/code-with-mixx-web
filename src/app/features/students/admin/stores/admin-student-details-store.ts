import { computed, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
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

const initialParams: StudentDetailsQueryParams = {
  pageNumber: 1,
  pageSize: 10,
  reservationType: null,
};

export const AdminStudentDetailsStore = signalStore(
  withState<AdminStudentDetailsState>(() => ({
    studentId: inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '',
    params: initialParams,
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
    isLoadError: computed(
      () =>
        store.detailsQuery.isError() &&
        store.detailsQuery.error()?.errorCode !== 'Student.NotFound',
    ),
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
  withHooks({
    onInit(store) {
      const router = inject(Router);

      inject(ActivatedRoute)
        .paramMap.pipe(takeUntilDestroyed())
        .subscribe((paramMap) => {
          const studentId = paramMap.get('id') ?? '';
          if (studentId === store.studentId()) return;
          patchState(store, { studentId, params: initialParams });
        });

      effect(() => {
        if (!store.isLoadError()) return;
        untracked(() => router.navigate(['/admin/students']));
      });
    },
  }),
);
