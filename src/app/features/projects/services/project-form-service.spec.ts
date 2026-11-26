import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  createProblemDetails,
  createToastServiceMock,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { AdminProjectReservationStore } from '@features/projects/admin/stores/admin-project-reservation-store';
import {
  createProjectReservationDetails,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  flushReservationDetailsRefetch,
  PROJECT_RESERVATIONS_URL,
  provideReservationFormTesting,
} from '@features/projects/testing/project-test-utils';
import { createEmptyProject } from '../factories/project-factories';
import { ProjectItemFormModel } from '../models/project-reservation-request';
import { ProjectFormService } from './project-form-service';

describe('ProjectFormService', () => {
  let service: ProjectFormService;

  function createProject(id: number, noteIds: number[]): ProjectItemFormModel {
    return {
      ...createEmptyProject(),
      id,
      notes: noteIds.map((noteId) => ({ id: noteId, content: `Beleška ${noteId}` })),
    };
  }

  function projects() {
    return service.reservationModel().projects;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpTesting()] });
    service = TestBed.inject(ProjectFormService);
    service.reservationModel.update((model) => ({
      ...model,
      projects: [createProject(1, [11, 12]), createProject(2, [21])],
    }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('removeNote', () => {
    it('should mark an existing note for deletion only on its own project', () => {
      service.removeNote(0, 0);

      expect(projects()[0].notes.map((n) => n.id)).toEqual([12]);
      expect(projects()[0].notesToDelete).toEqual([11]);
      expect(projects()[1].notes.map((n) => n.id)).toEqual([21]);
      expect(projects()[1].notesToDelete).toEqual([]);
    });

    it('should remove only the selected unsaved note', () => {
      service.addNote(1, 'Nova A');
      service.addNote(1, 'Nova B');

      service.removeNote(1, 1);

      expect(projects()[1].notes.map((n) => n.content)).toEqual(['Beleška 21', 'Nova B']);
      expect(projects()[1].notesToDelete).toEqual([]);
    });

    it('should ignore an unknown note index', () => {
      const before = service.reservationModel();

      service.removeNote(0, 5);

      expect(service.reservationModel()).toBe(before);
    });
  });

  describe('project name validation', () => {
    function nameErrors(name: string) {
      service.updateProject(0, { name });
      return service.reservationForm.projects[0].name().errors();
    }

    it('should require a name', () => {
      expect(nameErrors('')).toEqual([expect.objectContaining({ kind: 'required' })]);
    });

    it('should accept a name of exactly 100 characters', () => {
      expect(nameErrors('a'.repeat(100))).toEqual([]);
    });

    it('should reject a name longer than 100 characters', () => {
      expect(nameErrors('a'.repeat(101))).toEqual([expect.objectContaining({ kind: 'maxLength' })]);
    });
  });
});

describe('ProjectFormService on the reservation pages', () => {
  let form: ProjectFormService;
  let store: InstanceType<typeof AdminProjectReservationStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  const checkLabels = () =>
    form.checks().map((check) => (check.isValid ? check.validLabel : check.invalidLabel));

  const setup = async (reservationId: string | null) => {
    toast = createToastServiceMock();
    TestBed.configureTestingModule({
      providers: [
        provideReservationFormTesting(reservationId),
        provideHttpTesting({ toastService: toast }),
      ],
    });

    form = TestBed.inject(ProjectFormService);
    store = TestBed.inject(AdminProjectReservationStore);
    http = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await flushLookups();
  };

  const loadDetails = async (overrides = {}) => {
    expectReservationDetailsRequest().flush(createProjectReservationDetails(overrides));
    await settle();
  };

  afterEach(() => {
    flushReservationDetailsRefetch();
    http.verify();
  });

  describe('totals', () => {
    beforeEach(() => setup(null));

    it('sums the project prices and keeps the entered total as the price', () => {
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice: 9000,
          projects: [6000, 6000].map((price) => ({ ...createEmptyProject(), subjectId: 1, price })),
        }),
      );

      expect(form.itemsTotal()).toBe(12000);
      expect(form.totalPrice()).toBe(9000);
    });
  });

  describe('checks', () => {
    beforeEach(() => setup(null));

    it('a fresh form is missing the student and the subject, so it cannot be saved', () => {
      expect(checkLabels()).toContain('Student nije izabran');
      expect(checkLabels()).toContain('Svi projekti moraju imati izabrani predmet.');
      expect(form.reservationForm().valid()).toBe(false);
    });

    it('a complete form passes every check and can be saved', () => {
      form.reservationModel.set(createValidReservationModel());

      expect(checkLabels()).toEqual([
        'Student je izabran',
        'Rezervacija ima bar jedan projekat',
        'Polja svih projekata su ispravna',
        'Svi projekti imaju izabrani predmet.',
      ]);
      expect(form.reservationForm().valid()).toBe(true);
    });

    it('a project ending before it starts fails the project fields check', () => {
      form.reservationModel.set(
        createValidReservationModel({
          projects: [
            {
              ...createEmptyProject(),
              subjectId: 1,
              startDate: '2026-10-20',
              endDate: '2026-10-10',
              reservedAt: '2026-10-01',
            },
          ],
          reservedAt: '2026-10-01',
        }),
      );

      expect(checkLabels()).toContain('Neka polja projekata nisu ispravna');
      expect(form.reservationForm().valid()).toBe(false);
    });
  });

  describe('saving a new reservation', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(createValidReservationModel({ description: '' }));
    });

    it('creates the reservation, sends empty optional fields as null and goes back to the list', async () => {
      form.save(null);
      await settle();

      const request = http.expectOne(
        (req) => req.url === PROJECT_RESERVATIONS_URL && req.method === 'POST',
      );
      expect(request.request.body).toEqual(
        expect.objectContaining({
          id: 0,
          studentId: 'student-1',
          totalPrice: 6000,
          description: null,
        }),
      );
      expect(request.request.body.projects[0]).toEqual(
        expect.objectContaining({ subjectId: 1, githubLink: null, downloadLink: null }),
      );
      request.flush(null);
      await settle();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno kreirana.');
      expect(navigateByUrl).toHaveBeenCalledWith('/admin/projects');
    });

    it('marks the store as saving while the request is running', async () => {
      form.save(null);
      await settle();

      expect(store.isSaving()).toBe(true);

      http.expectOne((req) => req.method === 'POST').flush(null);
      await settle();
      expect(store.isSaving()).toBe(false);
    });

    it('stays on the page and shows the domain error when saving fails', async () => {
      form.save(null);
      await settle();

      http
        .expectOne((req) => req.method === 'POST')
        .flush(createProblemDetails('Student.NotFound'), { status: 404, statusText: 'Not Found' });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.',
      );
      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  it('updates the loaded reservation', async () => {
    await setup('7');
    await loadDetails();

    form.save(7);
    await settle();

    const request = http.expectOne(
      (req) => req.url === `${PROJECT_RESERVATIONS_URL}/7` && req.method === 'PUT',
    );
    expect(request.request.body).toEqual(
      expect.objectContaining({ id: 7, studentId: 'student-2', projectsToDelete: [] }),
    );
    expect(request.request.body.projects.map((project: { id: number }) => project.id)).toEqual([
      21,
    ]);
    request.flush(null);
    await settle();

    expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno ažurirana.');
    expect(navigateByUrl).toHaveBeenCalledWith('/admin/projects');
  });

  it('reset clears what was entered', async () => {
    await setup(null);
    form.reservationModel.set(createValidReservationModel());

    form.reset();

    expect(form.reservationModel().studentId).toBe('');
    expect(form.reservationModel().projects[0].subjectId).toBe(0);
  });
});
