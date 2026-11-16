import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassReservationSortBy } from '@features/classes/models/class-reservation-sort-by';
import { ClassService } from '@features/classes/services/class-service';
import {
  CLASS_RESERVATIONS_URL,
  CLASSES_SUMMARY_URL,
  createClassesSummary,
  createClassReservation,
  createPagedClassReservations,
  expectClassReservationsRequest,
  flushClassesSummary,
  paymentHistoryUrl,
  RESERVATIONS_URL,
} from '@features/classes/testing/class-test-utils';
import { AdminClassStore } from './admin-class-store';

describe('AdminClassStore', () => {
  let store: InstanceType<typeof AdminClassStore>;
  let http: HttpTestingController;

  const marko = createClassReservation({ id: 1 });
  const jelena = createClassReservation({ id: 2, studentFullName: 'Jelena Petrović' });
  const nikola = createClassReservation({ id: 3, studentFullName: 'Nikola Ilić' });

  const firstPage = createPagedClassReservations([marko, jelena], {
    totalCount: 3,
    totalPages: 2,
    hasNextPage: true,
  });
  const secondPage = createPagedClassReservations([nikola], {
    totalCount: 3,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const loadFirstPage = () =>
    flushClassesSummary(createClassesSummary({ reservations: firstPage }));

  const goToSecondPage = async () => {
    await loadFirstPage();
    store.nextPage();
    await settle();
    expectClassReservationsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  const ids = () => store.reservations().map((reservation) => reservation.id);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminClassStore, provideHttpTesting()] });
    store = TestBed.inject(AdminClassStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the summary for the first page, sorted by the start of the classes', async () => {
    await settle();
    const request = http.expectOne((req) => req.url === CLASSES_SUMMARY_URL);
    expect(request.request.params.get('pageNumber')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('15');
    expect(request.request.params.get('sortBy')).toBe(ClassReservationSortBy.StartDateAscending);
    expect(request.request.params.get('showOnlyDeletedReservations')).toBe('false');
    expect(request.request.params.get('showOnlyDeletedStudents')).toBe('false');
    request.flush(createClassesSummary({ reservations: firstPage }));
    await flushClassesSummary();

    expect(ids()).toEqual([1, 2]);
    http.expectNone((req) => req.url === CLASS_RESERVATIONS_URL);
  });

  describe('selection', () => {
    beforeEach(loadFirstPage);

    it('selects the first reservation automatically', () => {
      expect(store.selectedReservationId()).toBe(1);
    });

    it('keeps the selected reservation with fresh data after a mutation', async () => {
      store.selectReservation(jelena);

      const archive = TestBed.inject(ClassService).archiveClassReservationMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${CLASS_RESERVATIONS_URL}/2/archive`).flush(null);
      await flushClassesSummary(
        createClassesSummary({
          reservations: {
            ...firstPage,
            items: [marko, { ...jelena, deletedAt: '2026-11-10T10:00:00Z' }],
          },
        }),
      );
      await archive;

      expect(store.selectedReservationId()).toBe(2);
      expect(store.selectedReservation()?.deletedAt).toBe('2026-11-10T10:00:00Z');
    });

    it('falls back to the first reservation when the selected one leaves the list', async () => {
      store.selectReservation(jelena);

      const archive = TestBed.inject(ClassService).archiveClassReservationMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${CLASS_RESERVATIONS_URL}/2/archive`).flush(null);
      await flushClassesSummary(
        createClassesSummary({ reservations: { ...firstPage, items: [marko] } }),
      );
      await archive;

      expect(store.selectedReservationId()).toBe(1);
    });

    it('has nothing selected when the list becomes empty', async () => {
      const archive = TestBed.inject(ClassService).archiveClassReservationMutation.mutateAsync(1);
      await settle();
      http.expectOne(`${CLASS_RESERVATIONS_URL}/1/archive`).flush(null);
      await flushClassesSummary(
        createClassesSummary({ reservations: createPagedClassReservations([]) }),
      );
      await archive;

      expect(store.selectedReservation()).toBeUndefined();
    });

    it('can be cleared', () => {
      store.selectReservation(undefined);
      expect(store.selectedReservation()).toBeUndefined();
    });
  });

  describe('filters', () => {
    it('every filter goes back to the first page and is sent with the request', async () => {
      await goToSecondPage();

      store.setSubjectIds([1, 2]);
      store.setReservationStatuses([ReservationStatus.Confirmed]);
      store.setPaymentStatuses([PaymentStatus.Overdue]);
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expectClassReservationsRequest({
        pageNumber: '1',
        subjectIds: ['1', '2'],
        reservationStatuses: [ReservationStatus.Confirmed],
        paymentStatuses: [PaymentStatus.Overdue],
        sortBy: ClassReservationSortBy.StartDateAscending,
      }).flush(firstPage);
      await settle();
    });

    it('the archive and deleted students toggles flip their flag and go back to the first page', async () => {
      await goToSecondPage();

      store.toggleDeletedReservations();
      await settle();
      expectClassReservationsRequest({
        pageNumber: '1',
        showOnlyDeletedReservations: 'true',
      }).flush(firstPage);
      await settle();

      store.toggleDeletedStudents();
      store.toggleDeletedReservations();
      await settle();
      expectClassReservationsRequest({
        showOnlyDeletedReservations: 'false',
        showOnlyDeletedStudents: 'true',
      }).flush(firstPage);
      await settle();
    });

    it('clearing a filter shows the unfiltered list again without a new request', async () => {
      await loadFirstPage();

      store.setSubjectIds([2]);
      await settle();
      expectClassReservationsRequest({ subjectIds: ['2'] }).flush(
        createPagedClassReservations([jelena]),
      );
      await settle();
      expect(ids()).toEqual([2]);

      store.setSubjectIds([]);
      await settle();
      http.expectNone((req) => req.url === CLASS_RESERVATIONS_URL);
      expect(ids()).toEqual([1, 2]);
    });
  });

  describe('pagination', () => {
    it('moves between existing pages only', async () => {
      await loadFirstPage();

      store.previousPage();
      await settle();
      expect(store.params.pageNumber()).toBe(1);

      store.nextPage();
      await settle();
      expectClassReservationsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(ids()).toEqual([3]);

      store.nextPage();
      await settle();
      expect(store.params.pageNumber()).toBe(2);
    });

    it('keeps showing the previous page while the next one loads', async () => {
      await loadFirstPage();

      store.nextPage();
      await settle();
      expect(ids()).toEqual([1, 2]);
      expect(store.reservationsFetching()).toBe(true);

      expectClassReservationsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(store.reservationsFetching()).toBe(false);
    });

    it('moves to the last page that still has reservations when the current one becomes empty', async () => {
      await goToSecondPage();

      const archive = TestBed.inject(ClassService).archiveClassReservationMutation.mutateAsync(3);
      await settle();
      http.expectOne(`${CLASS_RESERVATIONS_URL}/3/archive`).flush(null);
      await flushClassesSummary(
        createClassesSummary({
          reservations: createPagedClassReservations([], { pageNumber: 2, totalPages: 1 }),
        }),
      );
      await archive;

      expect(store.params.pageNumber()).toBe(1);
      expectClassReservationsRequest({ pageNumber: '1' }).flush(
        createPagedClassReservations([marko, jelena]),
      );
      await settle();
      expect(ids()).toEqual([1, 2]);
    });

    it('goes back to the first page when nothing is left at all', async () => {
      await goToSecondPage();

      const archive = TestBed.inject(ClassService).archiveClassReservationMutation.mutateAsync(3);
      await settle();
      http.expectOne(`${CLASS_RESERVATIONS_URL}/3/archive`).flush(null);
      await flushClassesSummary(
        createClassesSummary({
          reservations: createPagedClassReservations([], { pageNumber: 2, totalPages: 0 }),
        }),
      );
      await archive;

      expect(store.params.pageNumber()).toBe(1);
      expectClassReservationsRequest({ pageNumber: '1' }).flush(createPagedClassReservations([]));
      await settle();
      expect(store.params.pageNumber()).toBe(1);
    });
  });

  describe('modals', () => {
    beforeEach(loadFirstPage);

    it('loads the payment history only while its modal is open', async () => {
      store.openModal('register-payment');
      await settle();
      http.expectNone(paymentHistoryUrl(1));

      store.openModal('payment-history');
      await settle();
      expect(store.isPaymentHistoryLoading()).toBe(true);
      http.expectOne(paymentHistoryUrl(1)).flush({ payments: [] });
      await settle();

      expect(store.isPaymentHistoryLoading()).toBe(false);
      expect(store.paymentHistory()).toEqual({ payments: [] });
    });

    it('loads the payment history of the selected reservation', async () => {
      store.selectReservation(jelena);
      store.openModal('payment-history');
      await settle();

      http.expectOne(paymentHistoryUrl(2)).flush({ payments: [] });
      await settle();
    });

    it('does not load any payment history when nothing is selected', async () => {
      store.selectReservation(undefined);
      store.openModal('payment-history');
      await settle();

      http.expectNone((req) => req.url.endsWith('/payments'));
    });

    it('closeModal closes the open modal', () => {
      store.openModal('update-status');
      store.closeModal();
      expect(store.reservationModal()).toBeNull();
    });
  });

  describe('mutation flags', () => {
    beforeEach(loadFirstPage);

    it.each([
      ['archive', 'archiveClassReservationMutation', `${CLASS_RESERVATIONS_URL}/1/archive`],
      ['restore', 'restoreClassReservationMutation', `${CLASS_RESERVATIONS_URL}/1/restore`],
      ['delete', 'deleteClassReservationMutation', `${RESERVATIONS_URL}/1`],
    ] as const)(
      'isArchiving stays true during %s until the summary is refreshed',
      async (_, mutation, url) => {
        const pending = TestBed.inject(ClassService)[mutation].mutateAsync(1);
        await settle();
        expect(store.isArchiving()).toBe(true);

        http.expectOne(url).flush(null);
        await settle();
        expect(store.isArchiving()).toBe(true);

        await flushClassesSummary(createClassesSummary({ reservations: firstPage }));
        await pending;
        await settle();
        expect(store.isArchiving()).toBe(false);
      },
    );
  });
});
