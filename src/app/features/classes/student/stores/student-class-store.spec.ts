import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { QueryClient } from '@tanstack/angular-query-experimental';
import {
  createStudentClassReservation,
  createStudentClassesSummary,
  expectStudentClassReservationsRequest,
  flushStudentClassesSummary,
  STUDENT_CLASSES_SUMMARY_URL,
  studentPaymentHistoryUrl,
} from '@features/classes/testing/class-test-utils';
import { StudentClassReservationItem } from '@features/classes/student/models/student-class-reservation-item';
import { PagedResult } from '@core/models/paged-result';
import { StudentClassStore } from './student-class-store';

describe('StudentClassStore', () => {
  let store: InstanceType<typeof StudentClassStore>;
  let http: HttpTestingController;

  const first = createStudentClassReservation({ id: 1 });
  const second = createStudentClassReservation({ id: 2 });
  const third = createStudentClassReservation({ id: 3 });

  const paged = (
    items: StudentClassReservationItem[],
    overrides: Partial<PagedResult<StudentClassReservationItem>> = {},
  ): PagedResult<StudentClassReservationItem> => ({
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 15,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    paginatedCount: items.length,
    ...overrides,
  });

  const firstPage = paged([first, second], { totalCount: 3, totalPages: 2, hasNextPage: true });
  const secondPage = paged([third], {
    totalCount: 3,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const loadFirstPage = () =>
    flushStudentClassesSummary(createStudentClassesSummary({ reservations: firstPage }));

  const goToSecondPage = async () => {
    await loadFirstPage();
    store.nextPage();
    await settle();
    expectStudentClassReservationsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  const ids = () => store.reservations().map((reservation) => reservation.id);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StudentClassStore, provideHttpTesting()] });
    store = TestBed.inject(StudentClassStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the student summary for the first page without the admin-only flags', async () => {
    await settle();
    const request = http.expectOne((req) => req.url === STUDENT_CLASSES_SUMMARY_URL);
    expect(request.request.params.get('pageNumber')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('15');
    expect(request.request.params.get('sortBy')).toBe('StartDateAscending');
    expect(request.request.params.has('showOnlyDeletedReservations')).toBe(false);
    expect(request.request.params.has('showOnlyDeletedStudents')).toBe(false);
    request.flush(createStudentClassesSummary({ reservations: firstPage }));
    await flushStudentClassesSummary();

    expect(ids()).toEqual([1, 2]);
    expect(store.selectedReservationId()).toBe(1);
  });

  it('every filter goes back to the first page and is sent with the request', async () => {
    await goToSecondPage();

    store.setSubjectIds([1, 2]);
    store.setReservationStatuses([ReservationStatus.Confirmed]);
    store.setPaymentStatuses([PaymentStatus.Overdue]);
    await settle();

    expect(store.params.pageNumber()).toBe(1);
    expectStudentClassReservationsRequest({
      pageNumber: '1',
      subjectIds: ['1', '2'],
      reservationStatuses: [ReservationStatus.Confirmed],
      paymentStatuses: [PaymentStatus.Overdue],
    }).flush(firstPage);
    await settle();
  });

  it('moves between existing pages only', async () => {
    await loadFirstPage();

    store.previousPage();
    await settle();
    expect(store.params.pageNumber()).toBe(1);

    store.nextPage();
    await settle();
    expectStudentClassReservationsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
    expect(ids()).toEqual([3]);

    store.nextPage();
    await settle();
    expect(store.params.pageNumber()).toBe(2);
  });

  it('moves to the last page that still has reservations when the current one comes back empty', async () => {
    await goToSecondPage();

    TestBed.inject(QueryClient).invalidateQueries();
    await flushStudentClassesSummary(
      createStudentClassesSummary({ reservations: paged([], { pageNumber: 2, totalPages: 1 }) }),
    );

    http
      .match(
        (req) =>
          req.url.endsWith('/student/reservations/classes') && req.params.get('pageNumber') === '2',
      )
      .forEach((req) => req.flush(paged([], { pageNumber: 2, totalPages: 1 })));
    await settle();

    expect(store.params.pageNumber()).toBe(1);
    expectStudentClassReservationsRequest({ pageNumber: '1' }).flush(paged([first, second]));
    await settle();
    expect(ids()).toEqual([1, 2]);
  });

  it('requests a scroll to the details on every manual selection only', async () => {
    await loadFirstPage();
    expect(store.detailsScrollRequests()).toBe(0);

    store.selectReservation(second);
    store.selectReservation(undefined);
    expect(store.detailsScrollRequests()).toBe(1);
  });

  it('loads the student payment history of the selected reservation only while it is open', async () => {
    await loadFirstPage();
    store.selectReservation(second);
    await settle();
    http.expectNone(studentPaymentHistoryUrl(2));

    store.openPaymentHistory();
    await settle();
    expect(store.isPaymentHistoryLoading()).toBe(true);
    http.expectOne(studentPaymentHistoryUrl(2)).flush({ payments: [] });
    await settle();
    expect(store.paymentHistory()).toEqual({ payments: [] });

    store.closePaymentHistory();
    expect(store.isPaymentHistoryOpen()).toBe(false);
  });
});
