import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import { ReservationType } from '@features/reservations';
import {
  createPagedReservations,
  createStudentDetails,
  createStudentReservation,
  expectStudentDetailsRequest,
  flushStudentDetails,
  flushStudentsLookup,
  provideStudentRoute,
} from '@features/students/testing/student-test-utils';
import { AdminStudentDetailsStore } from './admin-student-details-store';

describe('AdminStudentDetailsStore', () => {
  let store: InstanceType<typeof AdminStudentDetailsStore>;
  let http: HttpTestingController;

  const firstPage = createStudentDetails({
    reservations: createPagedReservations(
      [createStudentReservation({ id: 1 }), createStudentReservation({ id: 2 })],
      { totalCount: 12, totalPages: 2, hasNextPage: true },
    ),
  });
  const secondPage = createStudentDetails({
    reservations: createPagedReservations([createStudentReservation({ id: 3 })], {
      totalCount: 12,
      pageNumber: 2,
      totalPages: 2,
      hasPreviousPage: true,
    }),
  });

  const goToSecondPage = async () => {
    await flushStudentDetails(firstPage);
    store.nextPage();
    await settle();
    expectStudentDetailsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminStudentDetailsStore, provideStudentRoute('student-1'), provideHttpTesting()],
    });
    store = TestBed.inject(AdminStudentDetailsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the student from the route, first page of 10, without a type param', async () => {
    await flushStudentsLookup();
    const request = expectStudentDetailsRequest({
      pageNumber: '1',
      pageSize: '10',
      reservationType: null,
    });
    request.flush(firstPage);
    await settle();

    expect(store.student()?.id).toBe('student-1');
    expect(store.reservations().map((reservation) => reservation.id)).toEqual([1, 2]);
  });

  it('shows at least one page when the student has no reservations', async () => {
    await flushStudentDetails(
      createStudentDetails({ reservations: createPagedReservations([], { totalPages: 0 }) }),
    );

    expect(store.totalPages()).toBe(1);
    expect(store.currentPage()).toBe(1);
    expect(store.hasNextPage()).toBe(false);
  });

  describe('reservation type', () => {
    it('sends the type and goes back to the first page', async () => {
      await goToSecondPage();

      store.setReservationType(ReservationType.Project);
      await settle();

      expect(store.selectedReservationType()).toBe(ReservationType.Project);
      expectStudentDetailsRequest({
        pageNumber: '1',
        reservationType: ReservationType.Project,
      }).flush(firstPage);
      await settle();
    });

    it('"All" removes the type param instead of sending "All"', async () => {
      await flushStudentDetails(firstPage);
      store.setReservationType(ReservationType.Class);
      await settle();
      expectStudentDetailsRequest({ reservationType: ReservationType.Class }).flush(firstPage);
      await settle();

      store.setReservationType('All');
      await settle();

      expect(store.params.reservationType()).toBeNull();
      expect(store.selectedReservationType()).toBe('All');
      // Every visit refetches (staleTime 0), so the unfiltered list is loaded again.
      expectStudentDetailsRequest({ reservationType: null }).flush(firstPage);
      await settle();
    });
  });

  describe('pagination', () => {
    it('moves between existing pages only', async () => {
      await flushStudentDetails(firstPage);

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);

      store.nextPage();
      await settle();
      expectStudentDetailsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(store.currentPage()).toBe(2);

      store.nextPage();
      await settle();
      expect(store.params.pageNumber()).toBe(2);
    });

    it('keeps the profile and current reservations visible while the next page loads', async () => {
      await flushStudentDetails(firstPage);

      store.nextPage();
      await settle();

      expect(store.detailsPending()).toBe(false);
      expect(store.detailsFetching()).toBe(true);
      expect(store.student()?.firstName).toBe('Marko');
      expect(store.reservations().map((reservation) => reservation.id)).toEqual([1, 2]);

      expectStudentDetailsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
    });
  });

  describe('errors', () => {
    it('isNotFound is true only for Student.NotFound', async () => {
      await flushStudentsLookup();
      expectStudentDetailsRequest().flush(createProblemDetails('Student.NotFound'), {
        status: 404,
        statusText: 'Not Found',
      });
      await settle();

      expect(store.isNotFound()).toBe(true);
      expect(store.student()).toBeUndefined();
    });

    it('does not redirect for Student.NotFound, which has its own state', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      await flushStudentsLookup();
      expectStudentDetailsRequest().flush(createProblemDetails('Student.NotFound'), {
        status: 404,
        statusText: 'Not Found',
      });
      await settle();

      expect(store.isLoadError()).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('goes back to the students list when loading fails for any other reason', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      await flushStudentsLookup();
      expectStudentDetailsRequest().flush(
        createProblemDetails('General.InternalServerError', { status: 500 }),
        { status: 500, statusText: 'Internal Server Error' },
      );
      await settle();

      expect(store.isNotFound()).toBe(false);
      expect(store.isLoadError()).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/admin/students']);
    });
  });
});
