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
import { StudentSubjectItem } from '@features/subjects/models/student-subject-item';
import { StudentSubjectParams } from '@features/subjects/models/student-subject-params';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { SubjectService } from '@features/subjects/services/subject-service';

type StudentSubjectState = {
  params: StudentSubjectParams;
  detailsScrollRequests: number;
};

const initialState: StudentSubjectState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: SubjectSort.CreatedDescending,
  },
  detailsScrollRequests: 0,
};

export const StudentSubjectStore = signalStore(
  withState(initialState),
  withProps((store, subjectService = inject(SubjectService)) => ({
    subjectsQuery: subjectService.getPagedSubjectsForStudentQuery(
      store.params.pageNumber,
      store.params.pageSize,
      store.params.searchTerm,
      store.params.sortBy,
    ),
  })),
  withLinkedState((store) => ({
    selectedSubject: linkedSignal<StudentSubjectItem[], StudentSubjectItem | undefined>({
      source: () => store.subjectsQuery.data()?.items ?? [],
      computation: (subjects, previous) =>
        subjects.find((subject) => subject.id === previous?.value?.id) ?? subjects[0],
    }),
  })),
  withComputed((store) => ({
    pagedSubjects: computed(() => store.subjectsQuery.data()),
    pagedSubjectsItems: computed(() => store.subjectsQuery.data()?.items),
    selectedSubjectId: computed(() => store.selectedSubject()?.id),
    subjectsPending: computed(() => store.subjectsQuery.isPending()),
    subjectsFetching: computed(() => store.subjectsQuery.isFetching()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<StudentSubjectParams>) =>
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
      selectSubject(subject: StudentSubjectItem | undefined) {
        patchState(store, {
          selectedSubject: subject,
          detailsScrollRequests: subject
            ? store.detailsScrollRequests() + 1
            : store.detailsScrollRequests(),
        });
      },
    };
  }),
);
