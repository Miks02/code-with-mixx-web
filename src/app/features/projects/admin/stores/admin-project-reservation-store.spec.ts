import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectService } from '@features/projects/services/project-service';
import {
  createProjectReservationDetails,
  flushLookups,
  PROJECT_RESERVATIONS_URL,
  provideReservationRoute,
  STUDENTS_LOOKUP,
} from '@features/projects/testing/project-test-utils';
import { AdminProjectReservationStore } from './admin-project-reservation-store';

describe('AdminProjectReservationStore', () => {
  let store: InstanceType<typeof AdminProjectReservationStore>;
  let form: ProjectFormService;
  let http: HttpTestingController;

  const setup = (reservationId: string | null) => {
    TestBed.configureTestingModule({
      providers: [
        ProjectFormService,
        AdminProjectReservationStore,
        provideReservationRoute(reservationId),
        provideHttpTesting(),
      ],
    });
    store = TestBed.inject(AdminProjectReservationStore);
    form = TestBed.inject(ProjectFormService);
    http = TestBed.inject(HttpTestingController);
  };

  const detailsRequest = (id: number) =>
    http.expectOne(
      (req) => req.url === `${PROJECT_RESERVATIONS_URL}/${id}` && req.method === 'GET',
    );

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(async () => {
      setup(null);
      await flushLookups();
    });

    it('does not load any reservation and is not in edit mode', () => {
      http.expectNone((req) => req.url.startsWith(`${PROJECT_RESERVATIONS_URL}/`));
      expect(store.isEditMode()).toBe(false);
      expect(store.isNotFound()).toBe(false);
    });

    it('has no paid amount, so the paid column stays hidden', () => {
      expect(store.totalPaid()).toBeUndefined();
    });

    it('selectStudent writes the student into the form and selectedStudent follows it', () => {
      store.selectStudent(STUDENTS_LOOKUP[1]);
      expect(form.reservationModel().studentId).toBe('student-2');
      expect(store.selectedStudent()).toEqual(STUDENTS_LOOKUP[1]);

      store.selectStudent(null);
      expect(form.reservationModel().studentId).toBe('');
      expect(store.selectedStudent()).toBeNull();
    });

    it('isSaving is true while the reservation is being created', async () => {
      const create = TestBed.inject(ProjectService).createProjectReservationMutation.mutateAsync({
        ...form.reservationModel(),
        description: null,
        projects: [],
      });
      await settle();
      expect(store.isSaving()).toBe(true);

      http
        .expectOne((req) => req.url === PROJECT_RESERVATIONS_URL && req.method === 'POST')
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
      detailsRequest(7).flush(createProjectReservationDetails());
      await settle();

      const model = form.reservationModel();
      expect(model.id).toBe(7);
      expect(model.studentId).toBe('student-2');
      expect(model.totalPrice).toBe(9000);
      expect(model.description).toBe('Seminarski iz baza');
      expect(model.projects.map((project) => project.id)).toEqual([21]);
      expect(model.projects[0].githubLink).toBe('https://github.com/jelena/baze');
      expect(model.projects[0].downloadLink).toBe('');
      expect(store.selectedStudent()?.fullName).toBe('Jelena Petrović');
    });

    it('shows what was paid, and 0 until the reservation arrives', async () => {
      await flushLookups();
      expect(store.totalPaid()).toBe(0);

      detailsRequest(7).flush(createProjectReservationDetails({ paidAmount: 3000 }));
      await settle();
      expect(store.totalPaid()).toBe(3000);
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

    it('goes back to the projects list when loading fails for any other reason', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      await flushLookups();
      detailsRequest(7).flush(
        createProblemDetails('General.InternalServerError', { status: 500 }),
        { status: 500, statusText: 'Internal Server Error' },
      );
      await settle();

      expect(store.isNotFound()).toBe(false);
      expect(navigate).toHaveBeenCalledWith(['/admin/projects']);
    });
  });

  it.each(['abc', '0', '-3', '2.5'])(
    'treats the malformed id "%s" as not found without sending a request',
    async (id) => {
      setup(id);
      await flushLookups();

      expect(store.isEditMode()).toBe(true);
      expect(store.isNotFound()).toBe(true);
      http.expectNone((req) => req.url.startsWith(`${PROJECT_RESERVATIONS_URL}/`));
    },
  );
});
