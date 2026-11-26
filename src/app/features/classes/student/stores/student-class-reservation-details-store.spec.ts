import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import {
  createStudentClassReservationDetails,
  studentPaymentHistoryUrl,
  STUDENT_CLASS_RESERVATIONS_URL,
  provideReservationRoute,
} from '@features/classes/testing/class-test-utils';
import { StudentClassReservationDetailsStore } from '@features/classes/student/stores/student-class-reservation-details-store';

describe('StudentClassReservationDetailsStore', () => {
  let store: InstanceType<typeof StudentClassReservationDetailsStore>;
  let http: HttpTestingController;

  const setup = async (reservationId: string | null) => {
    TestBed.configureTestingModule({
      providers: [
        StudentClassReservationDetailsStore,
        provideReservationRoute(reservationId),
        provideHttpTesting(),
      ],
    });
    store = TestBed.inject(StudentClassReservationDetailsStore);
    http = TestBed.inject(HttpTestingController);
    await settle();
  };

  const detailsRequest = (id = 7) =>
    http.expectOne(
      (req) => req.url === `${STUDENT_CLASS_RESERVATIONS_URL}/${id}` && req.method === 'GET',
    );
  const paymentsRequest = (id = 7) => http.expectOne(studentPaymentHistoryUrl(id));

  const paymentHistory = {
    reservationId: 7,
    remainingAmount: 6000,
    bonusAmount: 0,
    paidSum: 3000,
    totalSum: 9000,
    reversedSum: 0,
    payments: [],
  };

  afterEach(() => http.verify());

  it('loads the reservation and its payments at the same time', async () => {
    await setup('7');

    detailsRequest().flush(createStudentClassReservationDetails());
    paymentsRequest().flush(paymentHistory);
    await settle();

    expect(store.details()?.id).toBe(7);
    expect(store.paymentHistory()?.paidSum).toBe(3000);
    expect(store.detailsPending()).toBe(false);
    expect(store.paymentHistoryPending()).toBe(false);
    expect(store.isNotFound()).toBe(false);
  });

  it('shows the not found state for Reservation.NotFound without leaving the page', async () => {
    await setup('7');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

    detailsRequest().flush(createProblemDetails('Reservation.NotFound'), {
      status: 404,
      statusText: 'Not Found',
    });
    paymentsRequest().flush(paymentHistory);
    await settle();

    expect(store.isNotFound()).toBe(true);
    expect(store.isLoadError()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes back to the classes list when loading fails for any other reason', async () => {
    await setup('7');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

    detailsRequest().flush(createProblemDetails('General.InternalServerError', { status: 500 }), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    paymentsRequest().flush(paymentHistory);
    await settle();

    expect(store.isNotFound()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/student/classes']);
  });

  it.each([null, 'abc', '0', '-3', '2.5'])(
    'treats the malformed id "%s" as not found without sending any request',
    async (id) => {
      await setup(id);

      expect(store.isNotFound()).toBe(true);
      http.expectNone((req) => req.url.startsWith(`${STUDENT_CLASS_RESERVATIONS_URL}/`));
      http.expectNone((req) => req.url.endsWith('/payments'));
    },
  );
});
