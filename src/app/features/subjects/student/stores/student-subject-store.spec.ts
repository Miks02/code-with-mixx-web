import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import {
  createPagedStudentSubjects,
  createStudentSubject,
  provideSubjectTesting,
  settle,
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

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StudentSubjectStore, provideSubjectTesting()] });
    store = TestBed.inject(StudentSubjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the first page with the default params', async () => {
    await settle();
    const request = expectSubjectsRequest();
    expect(request.request.params.get('pageNumber')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('15');
    expect(request.request.params.get('searchTerm')).toBe('');
    expect(request.request.params.get('sortBy')).toBe(SubjectSort.CreatedDescending);
    expect(store.subjectsPending()).toBe(true);

    request.flush(firstPage);
    await settle();

    expect(store.subjectsPending()).toBe(false);
    expect(store.pagedSubjects()).toEqual(firstPage);
    expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([1, 2]);
  });

  it('moves to the next page and back', async () => {
    await flushPage();

    store.nextPage();
    await flushPage(secondPage, { pageNumber: '2' });
    expect(store.params.pageNumber()).toBe(2);

    store.previousPage();
    await settle();
    expect(store.params.pageNumber()).toBe(1);
  });

  it('does not go past the first or the last page', async () => {
    await flushPage(createPagedStudentSubjects());

    store.previousPage();
    store.nextPage();
    await settle();

    expect(store.params.pageNumber()).toBe(1);
  });

  it('ignores paging before the first page has loaded', async () => {
    store.nextPage();
    await flushPage();

    expect(store.params.pageNumber()).toBe(1);
  });

  it('resets to the first page when the sort changes', async () => {
    await flushPage();
    store.nextPage();
    await flushPage(secondPage, { pageNumber: '2' });

    store.setSort(SubjectSort.NameAscending);
    await flushPage(firstPage, { pageNumber: '1', sortBy: SubjectSort.NameAscending });

    expect(store.params.pageNumber()).toBe(1);
  });

  it('debounces the search term and resets to the first page', async () => {
    await flushPage();
    store.nextPage();
    await flushPage(secondPage, { pageNumber: '2' });

    store.setSearchTerm('ba');
    store.setSearchTerm('baz');
    await new Promise((resolve) => setTimeout(resolve, 350));
    await flushPage(firstPage, { pageNumber: '1', searchTerm: 'baz' });

    expect(store.params.searchTerm()).toBe('baz');
    expect(store.params.pageNumber()).toBe(1);
  });

  describe('selection', () => {
    it('selects the first subject once the page loads', async () => {
      expect(store.selectedSubject()).toBeUndefined();

      await flushPage();

      expect(store.selectedSubjectId()).toBe(1);
    });

    it('keeps the selected subject when it is still on the refetched page', async () => {
      await flushPage();
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
      await flushPage();
      store.selectSubject(store.pagedSubjectsItems()![1]);

      store.nextPage();
      await flushPage(secondPage, { pageNumber: '2' });

      expect(store.selectedSubjectId()).toBe(3);
    });

    it('requests a scroll to the details only when a subject is selected', async () => {
      await flushPage();

      store.selectSubject(store.pagedSubjectsItems()![1]);
      expect(store.detailsScrollRequests()).toBe(1);

      store.selectSubject(undefined);
      expect(store.selectedSubject()).toBeUndefined();
      expect(store.detailsScrollRequests()).toBe(1);
    });
  });
});
