import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import {
  createPagedStudentSubjects,
  createStudentSubject,
  createStudentSubjectsSummary,
  flushStudentSummary,
  provideSubjectTesting,
  settle,
  STUDENT_SUBJECTS_SUMMARY_URL,
  STUDENT_SUBJECTS_URL,
} from '@features/subjects/testing/subject-test-utils';
import { StudentSubjectStore } from './student-subject-store';

describe('StudentSubjectStore', () => {
  let store: InstanceType<typeof StudentSubjectStore>;
  let http: HttpTestingController;

  const firstPage = createPagedStudentSubjects(
    [createStudentSubject(), createStudentSubject({ id: 2 })],
    { totalCount: 4, totalPages: 2, hasNextPage: true },
  );
  const secondPage = createPagedStudentSubjects(
    [createStudentSubject({ id: 3 }), createStudentSubject({ id: 4 })],
    { totalCount: 4, pageNumber: 2, totalPages: 2, hasPreviousPage: true },
  );

  const expectSubjectsRequest = (params: Record<string, string> = {}) =>
    http.expectOne(
      (req) =>
        req.url === STUDENT_SUBJECTS_URL &&
        Object.entries(params).every(([key, value]) => req.params.get(key) === value),
    );

  const flushPage = async (page = firstPage, params: Record<string, string> = {}) => {
    await settle();
    expectSubjectsRequest(params).flush(page);
    await settle();
  };

  const loadSummary = () =>
    flushStudentSummary(createStudentSubjectsSummary({ pagedSubjects: firstPage }));

  const goToSecondPage = async () => {
    await loadSummary();
    store.nextPage();
    await flushPage(secondPage, { pageNumber: '2' });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StudentSubjectStore, provideSubjectTesting()] });
    store = TestBed.inject(StudentSubjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('summary', () => {
    it('requests the summary with the default params and waits for it', async () => {
      await settle();
      const request = http.expectOne((req) => req.url === STUDENT_SUBJECTS_SUMMARY_URL);
      expect(request.request.params.get('pageNumber')).toBe('1');
      expect(request.request.params.get('pageSize')).toBe('15');
      expect(request.request.params.get('searchTerm')).toBe('');
      expect(request.request.params.get('sortBy')).toBe(SubjectSort.CreatedDescending);
      expect(store.summaryPending()).toBe(true);
      expect(store.subjectsPending()).toBe(true);

      request.flush(createStudentSubjectsSummary({ pagedSubjects: firstPage }));
      await settle();

      expect(store.summaryPending()).toBe(false);
      expect(store.subjectsPending()).toBe(false);
    });

    it('exposes the summary and the first page without a second request', async () => {
      await flushStudentSummary(
        createStudentSubjectsSummary({
          totalSubjects: 4,
          pagedSubjects: firstPage,
          lastSubjectClass: { subjectName: 'Baze podataka', classDate: '2026-11-20' },
        }),
      );

      expect(store.summary()?.totalSubjects).toBe(4);
      expect(store.mostPopularSubject()?.id).toBe(1);
      expect(store.lastSubjectClass()?.subjectName).toBe('Baze podataka');
      expect(store.pagedSubjects()).toEqual(firstPage);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([1, 2]);
    });

    it('maps a missing most popular subject and last class to undefined', async () => {
      await flushStudentSummary(
        createStudentSubjectsSummary({ mostPopularSubject: null, lastSubjectClass: null }),
      );

      expect(store.mostPopularSubject()).toBeUndefined();
      expect(store.lastSubjectClass()).toBeUndefined();
    });
  });

  describe('pagination', () => {
    it('moves to the next page and back to the cached first page', async () => {
      await goToSecondPage();
      expect(store.params.pageNumber()).toBe(2);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([3, 4]);

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([1, 2]);
    });

    it('does not go past the first or the last page', async () => {
      await flushStudentSummary();

      store.previousPage();
      store.nextPage();
      await settle();

      expect(store.params.pageNumber()).toBe(1);
    });

    it('ignores paging before the summary has loaded', async () => {
      store.nextPage();
      await loadSummary();

      expect(store.params.pageNumber()).toBe(1);
    });
  });

  describe('filters', () => {
    it('resets to the first page when the sort changes', async () => {
      await goToSecondPage();

      store.setSort(SubjectSort.NameAscending);
      await flushPage(firstPage, { pageNumber: '1', sortBy: SubjectSort.NameAscending });

      expect(store.params.pageNumber()).toBe(1);
    });

    it('debounces the search term and resets to the first page', async () => {
      await goToSecondPage();

      store.setSearchTerm('ba');
      store.setSearchTerm('baz');
      await new Promise((resolve) => setTimeout(resolve, 350));
      await flushPage(firstPage, { pageNumber: '1', searchTerm: 'baz' });

      expect(store.params.searchTerm()).toBe('baz');
      expect(store.params.pageNumber()).toBe(1);
    });
  });

  describe('selection', () => {
    it('selects the first subject once the summary loads', async () => {
      expect(store.selectedSubject()).toBeUndefined();

      await loadSummary();

      expect(store.selectedSubjectId()).toBe(1);
    });

    it('keeps the selected subject when it is still on the refetched page', async () => {
      await loadSummary();
      store.selectSubject(store.pagedSubjectsItems()![1]);

      store.setSort(SubjectSort.NameAscending);
      await flushPage(
        createPagedStudentSubjects([
          createStudentSubject({ id: 5 }),
          createStudentSubject({ id: 2, classesCount: 9 }),
        ]),
        { sortBy: SubjectSort.NameAscending },
      );

      expect(store.selectedSubjectId()).toBe(2);
      expect(store.selectedSubject()?.classesCount).toBe(9);
    });

    it('falls back to the first subject when the selected one is no longer on the page', async () => {
      await loadSummary();
      store.selectSubject(store.pagedSubjectsItems()![1]);

      store.nextPage();
      await flushPage(secondPage, { pageNumber: '2' });

      expect(store.selectedSubjectId()).toBe(3);
    });

    it('requests a scroll to the details only when a subject is selected', async () => {
      await loadSummary();

      store.selectSubject(store.pagedSubjectsItems()![1]);
      expect(store.detailsScrollRequests()).toBe(1);

      store.selectSubject(undefined);
      expect(store.selectedSubject()).toBeUndefined();
      expect(store.detailsScrollRequests()).toBe(1);
    });
  });
});
