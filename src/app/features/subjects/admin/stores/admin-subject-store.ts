import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, pipe, tap } from 'rxjs';
import { AdminSubjectParams } from '@features/subjects/models/admin-subject-params';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { SubjectService } from '@features/subjects/services/subject-service';

type AdminSubjectsState = {
  params: AdminSubjectParams;
  selectedSubject: SubjectItem | undefined;
  isEditing: boolean;
};

const initialState: AdminSubjectsState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    onlyArchived: false,
    sortBy: SubjectSort.CreatedAscending,
  },
  selectedSubject: undefined,
  isEditing: false,
};

export const AdminSubjectsStore = signalStore(
  withState(initialState),
  withProps((store, subjectService = inject(SubjectService)) => {
    const summaryQuery = subjectService.getSubjectsSummaryForAdminQuery(
      store.params.pageNumber,
      store.params.pageSize,
      store.params.searchTerm,
      store.params.sortBy,
      store.params.onlyArchived,
    );

    return {
      summaryQuery,
      subjectsQuery: subjectService.getPagedSubjectsForAdminQuery(
        summaryQuery,
        store.params.pageNumber,
        store.params.pageSize,
        store.params.searchTerm,
        store.params.sortBy,
        store.params.onlyArchived,
      ),
    };
  }),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    mostPopularSubject: computed(() => store.summaryQuery.data()?.mostPopularSubject ?? undefined),
    pagedSubjects: computed(() => store.subjectsQuery.data()),
    subjectsPending: computed(() => store.subjectsQuery.isPending()),
    subjectsFetching: computed(() => store.subjectsQuery.isFetching()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<AdminSubjectParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setSearchTerm: rxMethod<string>(
        pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap((searchTerm) => patchParams({ searchTerm, pageNumber: 1 })),
        ),
      ),
      setSort(sortBy: SubjectSort) {
        patchParams({ sortBy, pageNumber: 1 });
      },
      setOnlyArchived(onlyArchived: boolean) {
        patchParams({ onlyArchived, pageNumber: 1 });
      },
      setPageNumber(pageNumber: number) {
        patchParams({ pageNumber });
      },
      selectSubject(subject: SubjectItem | undefined) {
        patchState(store, { selectedSubject: subject, isEditing: false });
      },
      updateSelectedSubject(changes: Partial<SubjectItem>) {
        const subject = store.selectedSubject();
        if (!subject) return;
        patchState(store, { selectedSubject: { ...subject, ...changes } });
      },
      startEditing() {
        if (!store.selectedSubject()) return;
        patchState(store, { isEditing: true });
      },
      stopEditing() {
        patchState(store, { isEditing: false });
      },
    };
  }),
);
