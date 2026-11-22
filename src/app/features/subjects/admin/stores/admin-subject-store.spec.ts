import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import {
  createPagedSubjects,
  createSubject,
  createSubjectsSummary,
  flushSummary,
  provideSubjectTesting,
  settle,
  SUBJECTS_SUMMARY_URL,
  SUBJECTS_URL,
} from '@features/subjects/testing/subject-test-utils';
import { AdminSubjectStore } from './admin-subject-store';

describe('AdminSubjectStore', () => {
  let store: InstanceType<typeof AdminSubjectStore>;
  let http: HttpTestingController;

  const firstPage = createPagedSubjects([createSubject(), createSubject({ id: 2 })], {
    totalCount: 4,
    totalPages: 2,
    hasNextPage: true,
  });
  const secondPage = createPagedSubjects([createSubject({ id: 3 }), createSubject({ id: 4 })], {
    totalCount: 4,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const expectSubjectsRequest = (params: Record<string, string>) =>
    http.expectOne(
      (req) =>
        req.url === SUBJECTS_URL &&
        Object.entries(params).every(([key, value]) => req.params.get(key) === value),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminSubjectStore, provideSubjectTesting()] });
    store = TestBed.inject(AdminSubjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('initial state', () => {
    it('starts on the first page with default filters, no selection and not editing', async () => {
      expect(store.params()).toEqual({
        pageNumber: 1,
        pageSize: 15,
        searchTerm: '',
        onlyArchived: false,
        sortBy: SubjectSort.CreatedAscending,
      });
      expect(store.selectedSubject()).toBeUndefined();
      expect(store.selectedSubjectId()).toBeUndefined();
      expect(store.isEditing()).toBe(false);
      await flushSummary();
    });

    it('requests the summary with the default params', async () => {
      await settle();
      const request = http.expectOne((req) => req.url === SUBJECTS_SUMMARY_URL);
      expect(request.request.params.get('pageNumber')).toBe('1');
      expect(request.request.params.get('pageSize')).toBe('15');
      expect(request.request.params.get('searchTerm')).toBe('');
      expect(request.request.params.get('sortBy')).toBe(SubjectSort.CreatedAscending);
      expect(request.request.params.get('onlyArchived')).toBe('false');
      request.flush(createSubjectsSummary());
      await settle();
    });

    it('is pending until the summary arrives and uses safe defaults meanwhile', async () => {
      await settle();
      expect(store.summaryPending()).toBe(true);
      expect(store.subjectsPending()).toBe(true);
      expect(store.pagedSubjectsItems()).toBeUndefined();
      expect(store.pagedSubjectsCount()).toBe(0);
      expect(store.pagedSubjectsTotalCount()).toBe(0);
      expect(store.currentPage()).toBe(1);
      expect(store.totalPages()).toBe(1);
      expect(store.hasPreviousPage()).toBe(false);
      expect(store.hasNextPage()).toBe(false);
      await flushSummary();
    });
  });

  describe('after the summary loads', () => {
    it('exposes the summary and the first page without a second request', async () => {
      const summary = createSubjectsSummary({ totalSubjects: 4, pagedSubjects: firstPage });
      await flushSummary(summary);

      expect(store.summaryPending()).toBe(false);
      expect(store.subjectsPending()).toBe(false);
      expect(store.summary()?.totalSubjects).toBe(4);
      expect(store.mostPopularSubject()?.id).toBe(1);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([1, 2]);
      expect(store.pagedSubjectsCount()).toBe(2);
      expect(store.pagedSubjectsTotalCount()).toBe(4);
      expect(store.currentPage()).toBe(1);
      expect(store.totalPages()).toBe(2);
      expect(store.hasNextPage()).toBe(true);
      // http.verify() in afterEach proves the paged list came from the summary, not a new GET.
    });

    it('formats subject dates for display', async () => {
      await flushSummary();
      const createdAt = store.pagedSubjectsItems()?.[0].createdAt;
      expect(createdAt).not.toBe('2026-01-15T00:00:00.000Z');
      expect(createdAt).toContain('2026');
    });

    it('maps a missing most popular subject to undefined', async () => {
      await flushSummary(createSubjectsSummary({ mostPopularSubject: null }));
      expect(store.mostPopularSubject()).toBeUndefined();
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      await flushSummary(createSubjectsSummary({ pagedSubjects: firstPage }));
    });

    it('nextPage loads the next page', async () => {
      store.nextPage();
      await settle();

      expectSubjectsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();

      expect(store.params.pageNumber()).toBe(2);
      expect(store.currentPage()).toBe(2);
      expect(store.hasPreviousPage()).toBe(true);
      expect(store.hasNextPage()).toBe(false);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([3, 4]);
    });

    it('nextPage does nothing on the last page', async () => {
      store.nextPage();
      await settle();
      expectSubjectsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();

      store.nextPage();
      await settle();

      expect(store.params.pageNumber()).toBe(2);
    });

    it('previousPage does nothing on the first page', async () => {
      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);
    });

    it('previousPage goes back to the already cached page', async () => {
      store.nextPage();
      await settle();
      expectSubjectsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();

      store.previousPage();
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expect(store.pagedSubjectsItems()?.map((subject) => subject.id)).toEqual([1, 2]);
    });
  });

  describe('filters', () => {
    const goToSecondPage = async () => {
      await flushSummary(createSubjectsSummary({ pagedSubjects: firstPage }));
      store.nextPage();
      await settle();
      expectSubjectsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
    };

    it('setSort changes the sort and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSort(SubjectSort.NameAscending);
      await settle();

      expect(store.params.sortBy()).toBe(SubjectSort.NameAscending);
      expect(store.params.pageNumber()).toBe(1);
      expectSubjectsRequest({ pageNumber: '1', sortBy: SubjectSort.NameAscending }).flush(
        firstPage,
      );
      await settle();
    });

    it('toggleOnlyArchived flips the filter and goes back to the first page', async () => {
      await goToSecondPage();

      store.toggleOnlyArchived();
      await settle();

      expect(store.params.onlyArchived()).toBe(true);
      expect(store.params.pageNumber()).toBe(1);
      expectSubjectsRequest({ pageNumber: '1', onlyArchived: 'true' }).flush(firstPage);
      await settle();

      store.toggleOnlyArchived();
      await settle();
      expect(store.params.onlyArchived()).toBe(false);
    });

    it('setSearchTerm is debounced and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSearchTerm('sql');
      await settle();
      expect(store.params.searchTerm()).toBe('');
      expect(store.params.pageNumber()).toBe(2);

      await new Promise((resolve) => setTimeout(resolve, 350));
      await settle();

      expect(store.params.searchTerm()).toBe('sql');
      expect(store.params.pageNumber()).toBe(1);
      expectSubjectsRequest({ pageNumber: '1', searchTerm: 'sql' }).flush(firstPage);
      await settle();
    });

    it('setSearchTerm only applies the last term typed within the debounce window', async () => {
      await flushSummary();

      store.setSearchTerm('s');
      store.setSearchTerm('sq');
      store.setSearchTerm('sql');
      await new Promise((resolve) => setTimeout(resolve, 350));
      await settle();

      expect(store.params.searchTerm()).toBe('sql');
      expectSubjectsRequest({ searchTerm: 'sql' }).flush(firstPage);
      await settle();
    });
  });

  describe('selection and editing', () => {
    beforeEach(async () => {
      await flushSummary(createSubjectsSummary({ pagedSubjects: firstPage }));
    });

    it('selects the first subject automatically', () => {
      expect(store.selectedSubjectId()).toBe(1);
    });

    it('keeps the selected subject with fresh data after the list reloads', async () => {
      store.selectSubject(store.pagedSubjectsItems()?.[1]);

      store.setSort(SubjectSort.NameAscending);
      await settle();
      expectSubjectsRequest({ pageNumber: '1' }).flush(
        createPagedSubjects([createSubject(), createSubject({ id: 2, classesCount: 9 })]),
      );
      await settle();

      expect(store.selectedSubjectId()).toBe(2);
      expect(store.selectedSubject()?.classesCount).toBe(9);
    });

    it('falls back to the first subject when the selected one leaves the list', async () => {
      store.selectSubject(store.pagedSubjectsItems()?.[1]);

      store.nextPage();
      await settle();
      expectSubjectsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();

      expect(store.selectedSubjectId()).toBe(3);
    });

    it('selectSubject sets the selected subject and its id', () => {
      const subject = createSubject({ id: 5 });
      store.selectSubject(subject);

      expect(store.selectedSubject()).toEqual(subject);
      expect(store.selectedSubjectId()).toBe(5);
    });

    it('selectSubject(undefined) clears the selection', () => {
      store.selectSubject(createSubject());
      store.selectSubject(undefined);

      expect(store.selectedSubject()).toBeUndefined();
    });

    it('selectSubject closes the edit form', () => {
      store.selectSubject(createSubject());
      store.startEditing();

      store.selectSubject(createSubject({ id: 2 }));

      expect(store.isEditing()).toBe(false);
    });

    it('startEditing is ignored when nothing is selected', () => {
      store.selectSubject(undefined);
      store.startEditing();
      expect(store.isEditing()).toBe(false);
    });

    it('startEditing and stopEditing toggle the edit mode', () => {
      store.selectSubject(createSubject());

      store.startEditing();
      expect(store.isEditing()).toBe(true);

      store.stopEditing();
      expect(store.isEditing()).toBe(false);
    });

    it('updateSelectedSubject merges changes into the selected subject', () => {
      store.selectSubject(createSubject());

      store.updateSelectedSubject({ deletedAt: '16. novembar 2026.' });

      expect(store.selectedSubject()).toEqual(createSubject({ deletedAt: '16. novembar 2026.' }));
    });

    it('updateSelectedSubject does nothing without a selection', () => {
      store.selectSubject(undefined);
      store.updateSelectedSubject({ deletedAt: '16. novembar 2026.' });
      expect(store.selectedSubject()).toBeUndefined();
    });
  });
});
