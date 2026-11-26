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
import { StudentSubjectParams } from '@features/subjects/models/student-subject-params';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { SubjectService } from '@features/subjects/services/subject-service';

type StudentSubjectState = {
  params: StudentSubjectParams;
};

const initialState: StudentSubjectState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: SubjectSort.CreatedDescending,
  },
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
  withComputed((store) => ({
    pagedSubjects: computed(() => store.subjectsQuery.data()),
    pagedSubjectsItems: computed(() => store.subjectsQuery.data()?.items),
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
    };
  }),
);
