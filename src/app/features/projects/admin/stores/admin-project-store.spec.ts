import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ProjectType } from '@features/projects/models/project-type';
import { ProjectService } from '@features/projects/services/project-service';
import {
  createPagedProjectReservations,
  createProjectReservation,
  createProjectsSummary,
  expectProjectReservationsRequest,
  flushProjectsSummary,
  paymentHistoryUrl,
  PROJECT_RESERVATIONS_URL,
  PROJECTS_SUMMARY_URL,
  RESERVATIONS_URL,
} from '@features/projects/testing/project-test-utils';
import { AdminProjectStore } from './admin-project-store';

describe('AdminProjectStore', () => {
  let store: InstanceType<typeof AdminProjectStore>;
  let http: HttpTestingController;

  const marko = createProjectReservation({ id: 1 });
  const jelena = createProjectReservation({ id: 2, studentFullName: 'Jelena Petrović' });
  const nikola = createProjectReservation({ id: 3, studentFullName: 'Nikola Ilić' });

  const firstPage = createPagedProjectReservations([marko, jelena], {
    totalCount: 3,
    totalPages: 2,
    hasNextPage: true,
  });
  const secondPage = createPagedProjectReservations([nikola], {
    totalCount: 3,
    pageNumber: 2,
    totalPages: 2,
    hasPreviousPage: true,
  });

  const loadFirstPage = () =>
    flushProjectsSummary(createProjectsSummary({ reservations: firstPage }));

  const goToSecondPage = async () => {
    await loadFirstPage();
    store.nextPage();
    await settle();
    expectProjectReservationsRequest({ pageNumber: '2' }).flush(secondPage);
    await settle();
  };

  const ids = () => store.reservations().map((reservation) => reservation.id);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminProjectStore, provideHttpTesting()] });
    store = TestBed.inject(AdminProjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the summary for the first page without any filter', async () => {
    await settle();
    const request = http.expectOne((req) => req.url === PROJECTS_SUMMARY_URL);
    expect(request.request.params.get('pageNumber')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('15');
    expect(request.request.params.get('showOnlyDeletedReservations')).toBe('false');
    expect(request.request.params.get('showOnlyDeletedStudents')).toBe('false');
    request.flush(createProjectsSummary({ reservations: firstPage }));
    await flushProjectsSummary();

    expect(ids()).toEqual([1, 2]);
  });

  describe('selection', () => {
    beforeEach(loadFirstPage);

    it('selects the first reservation automatically', () => {
      expect(store.selectedReservationId()).toBe(1);
    });

    it('keeps the selected reservation with fresh data after a mutation', async () => {
      store.selectReservation(jelena);

      const archive =
        TestBed.inject(ProjectService).archiveProjectReservationMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${PROJECT_RESERVATIONS_URL}/2/archive`).flush(null);
      await flushProjectsSummary(
        createProjectsSummary({
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

      const archive =
        TestBed.inject(ProjectService).archiveProjectReservationMutation.mutateAsync(2);
      await settle();
      http.expectOne(`${PROJECT_RESERVATIONS_URL}/2/archive`).flush(null);
      await flushProjectsSummary(
        createProjectsSummary({ reservations: { ...firstPage, items: [marko] } }),
      );
      await archive;

      expect(store.selectedReservationId()).toBe(1);
    });

    it('can be cleared', () => {
      store.selectReservation(undefined);
      expect(store.selectedReservation()).toBeUndefined();
    });

    it('does not request a scroll to the details for the automatic selection', () => {
      expect(store.detailsScrollRequests()).toBe(0);
    });

    it('requests a scroll to the details on every selection, including the same reservation', () => {
      store.selectReservation(jelena);
      store.selectReservation(jelena);
      expect(store.detailsScrollRequests()).toBe(2);
    });

    it('does not request a scroll when the selection is cleared', () => {
      store.selectReservation(jelena);
      store.selectReservation(undefined);
      expect(store.detailsScrollRequests()).toBe(1);
    });
  });

  describe('filters', () => {
    it('every filter goes back to the first page and is sent with the request', async () => {
      await goToSecondPage();

      store.setSubjectIds([1, 2]);
      store.setProjectTypes([ProjectType.Graduation]);
      store.setReservationStatuses([ReservationStatus.Confirmed]);
      store.setPaymentStatuses([PaymentStatus.Overdue]);
      await settle();

      expect(store.params.pageNumber()).toBe(1);
      expectProjectReservationsRequest({
        pageNumber: '1',
        subjectIds: ['1', '2'],
        projectTypes: [ProjectType.Graduation],
        reservationStatuses: [ReservationStatus.Confirmed],
        paymentStatuses: [PaymentStatus.Overdue],
      }).flush(firstPage);
      await settle();
    });

    it('the archive and deleted students toggles flip their flag and go back to the first page', async () => {
      await goToSecondPage();

      store.toggleDeletedReservations();
      await settle();
      expectProjectReservationsRequest({
        pageNumber: '1',
        showOnlyDeletedReservations: 'true',
      }).flush(firstPage);
      await settle();

      store.toggleDeletedStudents();
      store.toggleDeletedReservations();
      await settle();
      expectProjectReservationsRequest({
        showOnlyDeletedReservations: 'false',
        showOnlyDeletedStudents: 'true',
      }).flush(firstPage);
      await settle();
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
      expectProjectReservationsRequest({ pageNumber: '2' }).flush(secondPage);
      await settle();
      expect(ids()).toEqual([3]);

      store.nextPage();
      await settle();
      expect(store.params.pageNumber()).toBe(2);
    });

    it('moves to the last page that still has reservations when the current one becomes empty', async () => {
      await goToSecondPage();

      const archive =
        TestBed.inject(ProjectService).archiveProjectReservationMutation.mutateAsync(3);
      await settle();
      http.expectOne(`${PROJECT_RESERVATIONS_URL}/3/archive`).flush(null);
      await flushProjectsSummary(
        createProjectsSummary({
          reservations: createPagedProjectReservations([], { pageNumber: 2, totalPages: 1 }),
        }),
      );
      await archive;

      expect(store.params.pageNumber()).toBe(1);
      expectProjectReservationsRequest({ pageNumber: '1' }).flush(
        createPagedProjectReservations([marko, jelena]),
      );
      await settle();
      expect(ids()).toEqual([1, 2]);
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

    it('closeModal and closeProjectModal reset only their own modal', () => {
      store.openModal('update-status');
      store.openProjectModal(10);

      store.closeModal();
      expect(store.reservationModal()).toBeNull();
      expect(store.editedProjectId()).toBe(10);

      store.closeProjectModal();
      expect(store.editedProjectId()).toBeNull();
    });
  });

  describe('mutation flags', () => {
    beforeEach(loadFirstPage);

    it.each([
      ['archive', 'archiveProjectReservationMutation', `${PROJECT_RESERVATIONS_URL}/1/archive`],
      ['restore', 'restoreProjectReservationMutation', `${PROJECT_RESERVATIONS_URL}/1/restore`],
      ['delete', 'deleteProjectReservationMutation', `${RESERVATIONS_URL}/1`],
    ] as const)(
      'isArchiving stays true during %s until the summary is refreshed',
      async (_, mutation, url) => {
        const pending = TestBed.inject(ProjectService)[mutation].mutateAsync(1);
        await settle();
        expect(store.isArchiving()).toBe(true);

        http.expectOne(url).flush(null);
        await settle();
        expect(store.isArchiving()).toBe(true);

        await flushProjectsSummary(createProjectsSummary({ reservations: firstPage }));
        await pending;
        await settle();
        expect(store.isArchiving()).toBe(false);
      },
    );
  });
});
