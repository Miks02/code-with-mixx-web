import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import { dateTimeInputValue } from '@core/utilities/date-helpers';
import { createClassReservationRequest } from '@features/classes/factories/class-factories';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassService } from '@features/classes/services/class-service';
import {
  CLASS_RESERVATIONS_URL,
  createClassReservationDetails,
  createValidReservationModel,
  flushLookups,
  provideReservationRoute,
  STUDENTS_LOOKUP,
} from '@features/classes/testing/class-test-utils';
import { AdminClassReservationStore } from './admin-class-reservation-store';

describe('AdminClassReservationStore', () => {
  let store: InstanceType<typeof AdminClassReservationStore>;
  let form: ClassFormService;
  let http: HttpTestingController;

  const setup = (reservationId: string | null) => {
    TestBed.configureTestingModule({
      providers: [
        ClassFormService,
        AdminClassReservationStore,
        provideReservationRoute(reservationId),
        provideHttpTesting(),
      ],
    });
    store = TestBed.inject(AdminClassReservationStore);
    form = TestBed.inject(ClassFormService);
    http = TestBed.inject(HttpTestingController);
  };

  const detailsRequest = (id: number) =>
    http.expectOne((req) => req.url === `${CLASS_RESERVATIONS_URL}/${id}` && req.method === 'GET');

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(async () => {
      setup(null);
      await flushLookups();
    });

    it('does not load any reservation and is not in edit mode', () => {
      http.expectNone((req) => req.url.startsWith(`${CLASS_RESERVATIONS_URL}/`));
      expect(store.isEditMode()).toBe(false);
      expect(store.isNotFound()).toBe(false);
      expect(store.isLoadError()).toBe(false);
    });

    it('has no paid amount, so the paid column stays hidden', () => {
      expect(store.totalPaid()).toBeUndefined();
    });

    it('exposes the subjects and students from the lookups', () => {
      expect(store.subjects()?.map((subject) => subject.id)).toEqual([1, 2]);
      expect(store.availableStudents()).toEqual(STUDENTS_LOOKUP);
    });

    it('selectStudent writes the student into the form and selectedStudent follows it', () => {
      store.selectStudent(STUDENTS_LOOKUP[1]);
      expect(form.reservationModel().studentId).toBe('student-2');
      expect(store.selectedStudent()).toEqual(STUDENTS_LOOKUP[1]);

      store.selectStudent(null);
      expect(form.reservationModel().studentId).toBe('');
      expect(store.selectedStudent()).toBeNull();
    });

    it('selectedStudent is empty for a student missing from the lookup', () => {
      form.reservationForm.studentId().value.set('deleted-student');
      expect(store.selectedStudent()).toBeNull();
    });

    it('isSaving is true while the reservation is being created', async () => {
      const create = TestBed.inject(ClassService).createClassReservationMutation.mutateAsync(
        createClassReservationRequest(createValidReservationModel()),
      );
      await settle();
      expect(store.isSaving()).toBe(true);

      http
        .expectOne((req) => req.url === CLASS_RESERVATIONS_URL && req.method === 'POST')
        .flush(null);
      await settle();
      http.match(() => true).forEach((req) => req.flush({}));
      await create;
      await settle();
      expect(store.isSaving()).toBe(false);
    });
  });

  describe('on the details page', () => {
    beforeEach(() => setup('7'));

    it('fills the form with the loaded reservation', async () => {
      await flushLookups();
      const details = createClassReservationDetails();
      detailsRequest(7).flush(details);
      await settle();

      const model = form.reservationModel();
      expect(model.studentId).toBe('student-2');
      expect(model.totalPrice).toBe(2600);
      expect(model.reservedAt).toBe('2026-10-01');
      expect(model.description).toBe('Priprema za kolokvijum');
      expect(model.classesToDelete).toEqual([]);
      expect(model.classes.map((classItem) => classItem.id)).toEqual([21, 22]);
      expect(model.classes[1].subjectId).toBe(2);
      expect(store.selectedStudent()?.fullName).toBe('Jelena Petrović');
    });

    it('converts the class times from UTC to local datetime-local values', async () => {
      await flushLookups();
      detailsRequest(7).flush(createClassReservationDetails());
      await settle();

      const [first] = form.reservationModel().classes;
      expect(first.startsAt).toBe(dateTimeInputValue(new Date('2026-10-05T10:00:00Z')));
      expect(first.endsAt).toBe(dateTimeInputValue(new Date('2026-10-05T10:45:00Z')));
    });

    it('turns a missing description into an empty field', async () => {
      await flushLookups();
      detailsRequest(7).flush(createClassReservationDetails({ description: null }));
      await settle();

      expect(form.reservationModel().description).toBe('');
    });

    it('shows what was paid, and 0 until the reservation arrives', async () => {
      await flushLookups();
      expect(store.totalPaid()).toBe(0);

      detailsRequest(7).flush(createClassReservationDetails({ paidAmount: 1300 }));
      await settle();
      expect(store.totalPaid()).toBe(1300);
    });

    it('shows the not found state for Reservation.NotFound without leaving the page', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      await flushLookups();
      detailsRequest(7).flush(createProblemDetails('Reservation.NotFound'), {
        status: 404,
        statusText: 'Not Found',
      });
      await settle();

      expect(store.isNotFound()).toBe(true);
      expect(store.isLoadError()).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('goes back to the classes list when loading fails for any other reason', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      await flushLookups();
      detailsRequest(7).flush(
        createProblemDetails('General.InternalServerError', { status: 500 }),
        { status: 500, statusText: 'Internal Server Error' },
      );
      await settle();

      expect(store.isNotFound()).toBe(false);
      expect(navigate).toHaveBeenCalledWith(['/admin/classes']);
    });
  });

  it.each(['abc', '0', '-3', '2.5'])(
    'treats the malformed id "%s" as not found without sending a request',
    async (id) => {
      setup(id);
      await flushLookups();

      expect(store.isEditMode()).toBe(true);
      expect(store.isNotFound()).toBe(true);
      http.expectNone((req) => req.url.startsWith(`${CLASS_RESERVATIONS_URL}/`));
    },
  );
});
