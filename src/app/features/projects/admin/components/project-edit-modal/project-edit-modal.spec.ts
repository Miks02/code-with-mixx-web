import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
  typeInto,
} from '@core/testing/test-utils';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import { ProjectDetails } from '@features/projects/models/project-details';
import {
  createProjectDetails,
  flushProjectsSummary,
  PROJECT_RESERVATIONS_URL,
} from '@features/projects/testing/project-test-utils';
import { ProjectEditModal } from './project-edit-modal';

describe('ProjectEditModal', () => {
  let fixture: ComponentFixture<ProjectEditModal>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminProjectStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;

  const projectUrl = `${PROJECT_RESERVATIONS_URL}/items/10`;
  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const notes = () =>
    Array.from(element.querySelectorAll('p.whitespace-pre-wrap')).map((note) =>
      note.textContent?.trim(),
    );
  const load = async (project: ProjectDetails | null = createProjectDetails()) => {
    await settle();
    http.expectOne(projectUrl).flush(project);
    await settle();
    await fixture.whenStable();
  };
  const addNote = async (content: string) => {
    typeInto(input('projectNewNote'), content);
    await fixture.whenStable();
    getButton(element, 'Dodaj')!.click();
    await fixture.whenStable();
  };
  const save = async () => {
    getButton(element, 'Sačuvaj')!.click();
    await settle();
  };
  const patchRequest = () =>
    http.expectOne((req) => req.url === projectUrl && req.method === 'PATCH');

  beforeEach(async () => {
    toast = createToastServiceMock();

    await TestBed.configureTestingModule({
      imports: [ProjectEditModal],
      providers: [AdminProjectStore, provideHttpTesting({ toastService: toast })],
    }).compileComponents();

    store = TestBed.inject(AdminProjectStore);
    http = TestBed.inject(HttpTestingController);
    await flushProjectsSummary();
    store.openProjectModal(10);

    fixture = TestBed.createComponent(ProjectEditModal);
    element = fixture.nativeElement;
  });

  afterEach(async () => {
    await flushProjectsSummary();
    http.match(projectUrl).forEach((req) => req.flush(createProjectDetails()));
    http.verify();
  });

  it('shows a skeleton until the project arrives, then the prefilled form', async () => {
    await settle();
    fixture.detectChanges();
    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.querySelector('form')).toBeNull();

    await load(createProjectDetails({ githubLink: 'https://github.com/marko/baze' }));

    expect(element.textContent).toContain('Baze podataka');
    expect(element.textContent).toContain('Seminarski');
    expect(input('projectPrice').value).toBe('6000');
    expect(input('projectGithubLink').value).toBe('https://github.com/marko/baze');
    expect(input('projectDownloadLink').value).toBe('');
    expect(notes()).toEqual(['Normalizovati tabele', 'Napisati upite']);
  });

  it('shows an error instead of the form when the project cannot be loaded', async () => {
    await settle();
    http.expectOne(projectUrl).flush(createProblemDetails('Project.NotFound'), {
      status: 404,
      statusText: 'Not Found',
    });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Nije moguće učitati projekat');
    expect(element.querySelector('form')).toBeNull();
  });

  it('closes through the store without saving', async () => {
    await load();

    getButton(element, 'Odustani')!.click();
    await fixture.whenStable();

    expect(store.editedProjectId()).toBeNull();
  });

  describe('saving', () => {
    beforeEach(() => load());

    it('sends only the changes the backend expects and closes', async () => {
      typeInto(input('projectPrice'), '6500');
      typeInto(input('projectGithubLink'), '  https://github.com/marko/baze  ');
      await fixture.whenStable();
      element.querySelector<HTMLButtonElement>('button[aria-label="Ukloni belešku"]')!.click();
      await fixture.whenStable();
      await addNote('  Dodati indekse  ');

      await save();

      const request = patchRequest();
      expect(request.request.body).toEqual({
        price: 6500,
        progress: 40,
        githubLink: 'https://github.com/marko/baze',
        downloadLink: null,
        notesToDelete: [11],
        notesToAdd: ['Dodati indekse'],
      });
      request.flush(null);
      await flushProjectsSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Projekat je uspešno ažuriran.');
      expect(store.editedProjectId()).toBeNull();
    });

    it('removing a note added in this session does not mark anything for deletion', async () => {
      await addNote('Privremena');
      const removeButtons = element.querySelectorAll<HTMLButtonElement>(
        'button[aria-label="Ukloni belešku"]',
      );
      removeButtons[removeButtons.length - 1].click();
      await fixture.whenStable();

      await save();

      const request = patchRequest();
      expect(request.request.body.notesToDelete).toEqual([]);
      expect(request.request.body.notesToAdd).toEqual([]);
      request.flush(null);
      await flushProjectsSummary();
    });

    it('ignores an empty note', async () => {
      await addNote('   ');
      expect(notes().length).toBe(2);
    });

    it('does not save a negative price and stays open', async () => {
      typeInto(input('projectPrice'), '-1');
      await fixture.whenStable();
      await save();
      await fixture.whenStable();

      http.expectNone((req) => req.method === 'PATCH');
      expect(element.textContent).toContain('Cena ne može biti manja od 0 RSD.');
      expect(store.editedProjectId()).toBe(10);
    });

    it('shows the domain error and stays open when saving fails', async () => {
      await save();

      patchRequest().flush(createProblemDetails('Reservation.CantUpdateAnArchivedReservation'), {
        status: 409,
        statusText: 'Conflict',
      });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Nije moguće izmeniti projekat iz arhivirane rezervacije.',
      );
      expect(store.editedProjectId()).toBe(10);
    });
  });

  it.each([
    ['an archived project', { isDeleted: true }, 'Projekat je arhiviran i ne može se menjati.'],
    [
      'a project of an archived reservation',
      { isReservationArchived: true },
      'Rezervacija je arhivirana, pa se projekat ne može menjati.',
    ],
  ])('%s is read-only and cannot be saved', async (_, overrides, reason) => {
    await load(createProjectDetails(overrides));

    expect(element.textContent).toContain(reason);
    expect(getButton(element, 'Sačuvaj')).toBeUndefined();
    expect(element.querySelector('button[aria-label="Ukloni belešku"]')).toBeNull();
    expect(input('projectPrice').disabled).toBe(true);
    expect(getButton(element, 'Zatvori')).toBeDefined();
  });
});
