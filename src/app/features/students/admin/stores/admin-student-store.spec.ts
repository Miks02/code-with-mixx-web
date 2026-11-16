import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountStatus } from '@core/models/account-status';
import { provideHttpTesting, settle, wait } from '@core/testing/test-utils';
import { StudentFilter } from '@features/students/models/student-filter';
import { StudentSort } from '@features/students/models/student-sort';
import { StudentService } from '@features/students/services/student-service';
import {
  createPagedStudents,
  createStudent,
  createStudentsSummary,
  expectStudentsRequest,
  flushStudentsSummary,
  STUDENTS_LOOKUP_URL,
  STUDENTS_SUMMARY_URL,
  STUDENTS_URL,
} from '@features/students/testing/student-test-utils';
import { AdminStudentStore } from './admin-student-store';

describe('AdminStudentStore', () => {
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;

  const marko = createStudent();
  const jelena = createStudent({ id: 'student-2', firstName: 'Jelena', lastName: 'Petrović' });
  const nikola = createStudent({ id: 'student-3', firstName: 'Nikola', lastName: 'Ilić' });

  const firstPage = createPagedStudents([marko, jelena], {
    totalCount: 3,
    totalPages: 2,
    hasNextPage: true,
  });
  const secondPage = createPagedStudents([nikola], {
    totalCount: 3,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const loadFirstPage = () =>
    flushStudentsSummary(
      createStudentsSummary({
        activeStudents: 3,
        pendingStudents: 1,
        deactivatedStudents: 2,
        deletedStudents: 4,
        mostActiveStudent: jelena,
        pagedStudents: firstPage,
      }),
    );

  const goToSecondPage = async () => {
    await loadFirstPage();
    store.nextPage();
    await settle();
    expectStudentsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminStudentStore, provideHttpTesting()] });
    store = TestBed.inject(AdminStudentStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('initial state', () => {
    it('requests the summary for the first page, oldest first, without filters', async () => {
      await settle();
      const request = http.expectOne((req) => req.url === STUDENTS_SUMMARY_URL);
      expect(request.request.params.get('pageNumber')).toBe('1');
      expect(request.request.params.get('pageSize')).toBe('15');
      expect(request.request.params.get('sortBy')).toBe(StudentSort.CreatedAscending);
      expect(request.request.params.getAll('filters')).toBeNull();
      request.flush(createStudentsSummary());
      await flushStudentsSummary();
    });

    it('uses safe defaults while loading', async () => {
      await settle();
      expect(store.summaryPending()).toBe(true);
      expect(store.studentsPending()).toBe(true);
      expect(store.students()).toEqual([]);
      expect(store.activeCount()).toBeUndefined();
      expect(store.mostActiveStudent()).toBeUndefined();
      expect(store.pagedCount()).toBe(0);
      expect(store.totalCount()).toBe(0);
      expect(store.currentPage()).toBe(1);
      expect(store.totalPages()).toBe(1);
      expect(store.hasNextPage()).toBe(false);
      expect(store.selectedStudent()).toBeUndefined();
      expect(store.isEditing()).toBe(false);
      expect(store.isCreateModalVisible()).toBe(false);
      await flushStudentsSummary();
    });
  });

  describe('after the summary loads', () => {
    beforeEach(loadFirstPage);

    it('exposes the counts and the most active student', () => {
      expect(store.summaryPending()).toBe(false);
      expect(store.activeCount()).toBe(3);
      expect(store.pendingCount()).toBe(1);
      expect(store.deactivatedCount()).toBe(2);
      expect(store.deletedCount()).toBe(4);
      expect(store.mostActiveStudent()?.id).toBe('student-2');
    });

    it('exposes the first page without a second request', () => {
      expect(store.studentsPending()).toBe(false);
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);
      expect(store.pagedCount()).toBe(2);
      expect(store.totalCount()).toBe(3);
      expect(store.totalPages()).toBe(2);
      expect(store.hasPreviousPage()).toBe(false);
      expect(store.hasNextPage()).toBe(true);
    });

    it('does not select a student automatically', () => {
      expect(store.selectedStudent()).toBeUndefined();
    });
  });

  describe('selection and editing', () => {
    beforeEach(loadFirstPage);

    it('selectStudent selects a student or clears the selection', () => {
      store.selectStudent(jelena);
      expect(store.selectedStudentId()).toBe('student-2');

      store.selectStudent(undefined);
      expect(store.selectedStudent()).toBeUndefined();
    });

    it('startEditing does nothing without a selected student', () => {
      store.startEditing();
      expect(store.isEditing()).toBe(false);
    });

    it('selecting another student closes the edit form', () => {
      store.selectStudent(marko);
      store.startEditing();
      expect(store.isEditing()).toBe(true);

      store.selectStudent(jelena);
      expect(store.isEditing()).toBe(false);
    });

    it('stopEditing closes the edit form and keeps the selection', () => {
      store.selectStudent(marko);
      store.startEditing();

      store.stopEditing();

      expect(store.isEditing()).toBe(false);
      expect(store.selectedStudentId()).toBe('student-1');
    });

    it('updateSelectedStudent merges the changes into the selected student', () => {
      store.selectStudent(marko);

      store.updateSelectedStudent({ accountStatus: AccountStatus.Deactivated });

      expect(store.selectedStudent()).toEqual({
        ...marko,
        accountStatus: AccountStatus.Deactivated,
      });
    });

    it('updateSelectedStudent does nothing without a selected student', () => {
      store.updateSelectedStudent({ firstName: 'Petar' });
      expect(store.selectedStudent()).toBeUndefined();
    });
  });

  describe('create modal', () => {
    it('opens and closes', async () => {
      store.openCreateModal();
      expect(store.isCreateModalVisible()).toBe(true);

      store.closeCreateModal();
      expect(store.isCreateModalVisible()).toBe(false);
      await flushStudentsSummary();
    });
  });

  describe('pagination', () => {
    it('nextPage and previousPage move between existing pages only', async () => {
      await loadFirstPage();

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);

      store.nextPage();
      await settle();
      expectStudentsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(store.currentPage()).toBe(2);
      expect(store.students().map((student) => student.id)).toEqual(['student-3']);

      store.nextPage();
      await settle();
      expect(store.params.pageNumber()).toBe(2);

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);
    });

    it('keeps showing the current page while the next one loads', async () => {
      await loadFirstPage();

      store.nextPage();
      await settle();

      expect(store.studentsFetching()).toBe(true);
      expect(store.studentsPending()).toBe(false);
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);

      expectStudentsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(store.studentsFetching()).toBe(false);
    });

    it('moves to the last existing page when the requested page comes back empty', async () => {
      await loadFirstPage();

      store.nextPage();
      await settle();
      expectStudentsRequest({ pageNumber: '2' }).flush(
        createPagedStudents([], { pageNumber: 2, totalPages: 1, hasPreviousPage: true }),
      );
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);
    });
  });

  describe('filters, sort and search', () => {
    it('setFilters sends every filter and goes back to the first page', async () => {
      await goToSecondPage();

      store.setFilters([StudentFilter.Active, StudentFilter.WithClasses]);
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expectStudentsRequest({
        pageNumber: '1',
        filters: [StudentFilter.Active, StudentFilter.WithClasses],
      }).flush(createPagedStudents([marko]));
      await settle();
      expect(store.students().map((student) => student.id)).toEqual(['student-1']);
    });

    it('setSort changes the sort and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSort(StudentSort.NameDescending);
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expectStudentsRequest({ pageNumber: '1', sortBy: StudentSort.NameDescending }).flush(
        firstPage,
      );
      await settle();
    });

    it('setSearchTerm is debounced and goes back to the first page', async () => {
      await goToSecondPage();

      store.setSearchTerm('j');
      store.setSearchTerm('je');
      store.setSearchTerm('jelena');
      await settle();
      expect(store.params.searchTerm()).toBe('');

      await wait(350);
      await settle();

      expect(store.params.searchTerm()).toBe('jelena');
      expect(store.params.pageNumber()).toBe(1);
      expectStudentsRequest({ pageNumber: '1', searchTerm: 'jelena' }).flush(
        createPagedStudents([jelena]),
      );
      await settle();
    });

    it('clearing the search term shows the full list again', async () => {
      await loadFirstPage();
      store.setSearchTerm('jelena');
      await wait(350);
      await settle();
      expectStudentsRequest({ searchTerm: 'jelena' }).flush(createPagedStudents([jelena]));
      await settle();
      expect(store.students().map((student) => student.id)).toEqual(['student-2']);

      store.setSearchTerm('');
      await wait(350);
      await settle();

      expect(store.params.searchTerm()).toBe('');
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);
    });
  });

  describe('refresh after a mutation', () => {
    it('reloads the list the admin is looking at, not the default one', async () => {
      await loadFirstPage();
      store.setSearchTerm('jelena');
      await wait(350);
      await settle();
      expectStudentsRequest({ searchTerm: 'jelena' }).flush(createPagedStudents([jelena]));
      await settle();

      TestBed.inject(StudentService).deactivateStudentMutation.mutate('student-2');
      await settle();
      http.expectOne(`${STUDENTS_URL}/student-2/deactivate`).flush(null);
      await settle();

      http.expectOne(STUDENTS_LOOKUP_URL).flush([]);
      const summaryRequest = http.expectOne((req) => req.url === STUDENTS_SUMMARY_URL);
      expect(summaryRequest.request.params.get('searchTerm')).toBe('jelena');
      summaryRequest.flush(
        createStudentsSummary({
          deactivatedStudents: 1,
          pagedStudents: createPagedStudents([
            { ...jelena, accountStatus: AccountStatus.Deactivated },
          ]),
        }),
      );
      await settle();

      expect(store.deactivatedCount()).toBe(1);
      expect(store.students()[0].accountStatus).toBe(AccountStatus.Deactivated);
    });

    it('moves to the last page that still has students when the current one becomes empty', async () => {
      await goToSecondPage();

      const remove = TestBed.inject(StudentService).deleteStudentMutation.mutateAsync('student-3');
      await settle();
      http.expectOne(`${STUDENTS_URL}/student-3`).flush(null);
      await flushStudentsSummary(
        createStudentsSummary({
          pagedStudents: createPagedStudents([], { pageNumber: 2, totalPages: 1 }),
        }),
      );
      await remove;

      expect(store.params.pageNumber()).toBe(1);
      // The delete invalidated the cached first page, so it is loaded again.
      expectStudentsRequest({ pageNumber: '1' }).flush(createPagedStudents([marko, jelena]));
      await settle();
      expect(store.students().map((student) => student.id)).toEqual(['student-1', 'student-2']);
    });
  });

  describe('student lookup', () => {
    it('is reloaded after a student is registered, so the header search finds them', async () => {
      await loadFirstPage();

      const create = TestBed.inject(StudentService).createStudentMutation.mutateAsync({
        firstName: 'Nikola',
        lastName: 'Ilić',
        email: 'nikola.ilic@example.com',
        phoneNumber: '+381641112223',
        university: '',
      });
      await settle();
      http.expectOne((req) => req.url === STUDENTS_URL && req.method === 'POST').flush(null);
      await settle();

      http.expectOne(STUDENTS_LOOKUP_URL).flush([]);
      await flushStudentsSummary();
      await create;
    });

    it('is not reloaded after an invitation, which changes no student data', async () => {
      await loadFirstPage();

      const invite = TestBed.inject(StudentService).sendInvitationMutation.mutateAsync('student-1');
      await settle();
      http.expectOne(`${STUDENTS_URL}/student-1/invite`).flush(null);
      await invite;
      await settle();

      http.expectNone(STUDENTS_LOOKUP_URL);
      http.expectNone((req) => req.url === STUDENTS_SUMMARY_URL);
    });
  });

  describe('mutation flags', () => {
    beforeEach(loadFirstPage);

    it('isStudentActionPending is true while an account action is running', async () => {
      expect(store.isStudentActionPending()).toBe(false);

      const invite = TestBed.inject(StudentService).sendInvitationMutation.mutateAsync('student-1');
      await settle();
      expect(store.isStudentActionPending()).toBe(true);

      http.expectOne(`${STUDENTS_URL}/student-1/invite`).flush(null);
      await invite;
      await settle();
      expect(store.isStudentActionPending()).toBe(false);
    });

    it('isUpdating stays true until the summary is refreshed', async () => {
      const update = TestBed.inject(StudentService).updateStudentMutation.mutateAsync({
        id: 'student-1',
        firstName: 'Marko',
        lastName: 'Jovanović',
        email: 'marko.jovanovic@example.com',
        phoneNumber: '+381601234567',
        university: '',
      });
      await settle();
      expect(store.isUpdating()).toBe(true);

      http.expectOne(`${STUDENTS_URL}/student-1`).flush(marko);
      await settle();
      expect(store.isUpdating()).toBe(true);

      await flushStudentsSummary();
      await update;
      await settle();
      expect(store.isUpdating()).toBe(false);
      expect(store.isCreating()).toBe(false);
    });
  });
});
