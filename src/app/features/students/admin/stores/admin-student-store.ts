import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, pipe, tap } from 'rxjs';
import { StudentFilter } from '@features/students/models/student-filter';
import { StudentItem } from '@features/students/models/student-item';
import { StudentQueryParams } from '@features/students/models/student-query-params';
import { StudentSort } from '@features/students/models/student-sort';
import { StudentService } from '@features/students/services/student-service';

type AdminStudentState = {
  params: StudentQueryParams;
  selectedStudent: StudentItem | undefined;
  isEditing: boolean;
  isCreateModalVisible: boolean;
};

const initialState: AdminStudentState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: StudentSort.CreatedAscending,
    filters: [],
  },
  selectedStudent: undefined,
  isEditing: false,
  isCreateModalVisible: false,
};

export const AdminStudentStore = signalStore(
  withState(initialState),
  withProps((store, studentService = inject(StudentService)) => {
    const summaryQuery = studentService.getStudentsSummaryQuery(store.params);

    return {
      summaryQuery,
      studentsQuery: studentService.getPagedStudentsQuery(store.params, summaryQuery),
      _createMutation: studentService.createStudentMutation,
      _updateMutation: studentService.updateStudentMutation,
      _activateMutation: studentService.activateStudentMutation,
      _deactivateMutation: studentService.deactivateStudentMutation,
      _deleteMutation: studentService.deleteStudentMutation,
      _sendInvitationMutation: studentService.sendInvitationMutation,
    };
  }),
  withComputed((store) => ({
    summaryPending: computed(() => store.summaryQuery.isPending()),
    activeCount: computed(() => store.summaryQuery.data()?.activeStudents),
    pendingCount: computed(() => store.summaryQuery.data()?.pendingStudents),
    deactivatedCount: computed(() => store.summaryQuery.data()?.deactivatedStudents),
    deletedCount: computed(() => store.summaryQuery.data()?.deletedStudents),
    mostActiveStudent: computed(() => store.summaryQuery.data()?.mostActiveStudent),
    students: computed(() => store.studentsQuery.data()?.items ?? []),
    pagedCount: computed(() => store.studentsQuery.data()?.paginatedCount ?? 0),
    totalCount: computed(() => store.studentsQuery.data()?.totalCount ?? 0),
    currentPage: computed(() => store.studentsQuery.data()?.pageNumber ?? 1),
    totalPages: computed(() => store.studentsQuery.data()?.totalPages ?? 1),
    hasPreviousPage: computed(() => store.studentsQuery.data()?.hasPreviousPage ?? false),
    hasNextPage: computed(() => store.studentsQuery.data()?.hasNextPage ?? false),
    studentsPending: computed(() => store.studentsQuery.isPending()),
    studentsFetching: computed(() => store.studentsQuery.isFetching()),
    selectedStudentId: computed(() => store.selectedStudent()?.id),
    isCreating: computed(() => store._createMutation.isPending()),
    isUpdating: computed(() => store._updateMutation.isPending()),
    isStudentActionPending: computed(
      () =>
        store._activateMutation.isPending() ||
        store._deactivateMutation.isPending() ||
        store._deleteMutation.isPending() ||
        store._sendInvitationMutation.isPending(),
    ),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<StudentQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setSearchTerm: rxMethod<string>(
        pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap((searchTerm) => patchParams({ searchTerm, pageNumber: 1 })),
        ),
      ),
      setSort(sortBy: StudentSort) {
        patchParams({ sortBy, pageNumber: 1 });
      },
      setFilters(filters: StudentFilter[]) {
        patchParams({ filters, pageNumber: 1 });
      },
      previousPage() {
        if (!store.hasPreviousPage()) return;
        patchParams({ pageNumber: store.currentPage() - 1 });
      },
      nextPage() {
        if (!store.hasNextPage()) return;
        patchParams({ pageNumber: store.currentPage() + 1 });
      },
      selectStudent(student: StudentItem | undefined) {
        patchState(store, { selectedStudent: student, isEditing: false });
      },
      updateSelectedStudent(changes: Partial<StudentItem>) {
        const student = store.selectedStudent();
        if (!student) return;
        patchState(store, { selectedStudent: { ...student, ...changes } });
      },
      startEditing() {
        if (!store.selectedStudent()) return;
        patchState(store, { isEditing: true });
      },
      stopEditing() {
        patchState(store, { isEditing: false });
      },
      openCreateModal() {
        patchState(store, { isCreateModalVisible: true });
      },
      closeCreateModal() {
        patchState(store, { isCreateModalVisible: false });
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect(() => {
        const paged = store.studentsQuery.data();
        if (!paged || paged.items.length > 0 || paged.pageNumber <= 1) return;

        const lastPage = Math.max(1, paged.totalPages);
        untracked(() => patchState(store, { params: { ...store.params(), pageNumber: lastPage } }));
      });
    },
  }),
);
