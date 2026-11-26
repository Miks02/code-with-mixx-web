import { computed, inject, linkedSignal } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withLinkedState,
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

type AdminSubjectState = {
  params: AdminSubjectParams;
  isEditing: boolean;
  detailsScrollRequests: number;
};

const initialState: AdminSubjectState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    onlyArchived: false,
    sortBy: SubjectSort.CreatedAscending,
  },
  isEditing: false,
  detailsScrollRequests: 0,
};

export const AdminSubjectStore = signalStore(
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
  withLinkedState((store) => ({
    selectedSubject: linkedSignal<SubjectItem[], SubjectItem | undefined>({
      source: () => store.subjectsQuery.data()?.items ?? [],
      computation: (subjects, previous) =>
        subjects.find((subject) => subject.id === previous?.value?.id) ?? subjects[0],
    }),
  })),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    mostPopularSubject: computed(() => store.summaryQuery.data()?.mostPopularSubject ?? undefined),
    pagedSubjectsItems: computed(() => store.subjectsQuery.data()?.items),
    pagedSubjects: computed(() => store.subjectsQuery.data()),
    selectedSubjectId: computed(() => store.selectedSubject()?.id),
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
      previousPage() {
        const page = store.pagedSubjects();
        if (!page?.hasPreviousPage) return;
        patchParams({ pageNumber: page.pageNumber - 1 });
      },
      nextPage() {
        const page = store.pagedSubjects();
        if (!page?.hasNextPage) return;
        patchParams({ pageNumber: page.pageNumber + 1 });
      },
      toggleOnlyArchived() {
        patchParams({ onlyArchived: !store.params.onlyArchived(), pageNumber: 1 });
      },
      selectSubject(subject: SubjectItem | undefined) {
        patchState(store, {
          selectedSubject: subject,
          isEditing: false,
          detailsScrollRequests: subject
            ? store.detailsScrollRequests() + 1
            : store.detailsScrollRequests(),
        });
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
