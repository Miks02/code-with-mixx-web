import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton, provideHttpTesting, settle, typeInto } from '@core/testing/test-utils';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectType } from '@features/projects/models/project-type';
import {
  createProjectReservationDetails,
  expectReservationDetailsRequest,
  flushLookups,
  provideReservationFormTesting,
} from '@features/projects/testing/project-test-utils';
import { ProjectReservationListForm } from './project-reservation-list-form';

describe('ProjectReservationListForm', () => {
  let fixture: ComponentFixture<ProjectReservationListForm>;
  let element: HTMLElement;
  let form: ProjectFormService;
  let http: HttpTestingController;

  const projects = () => form.reservationModel().projects;
  const removeButtons = () =>
    Array.from(
      element.querySelectorAll<HTMLButtonElement>(
        'app-button[aria-label="Ukloni projekat"] button',
      ),
    );
  const noteInputs = () =>
    Array.from(element.querySelectorAll<HTMLInputElement>('input[aria-label="Nova beleška"]'));
  const subjectSelect = (index: number) =>
    element.querySelector<HTMLSelectElement>(`#project-subject-${index}`)!;

  const setup = async (reservationId: string | null) => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationListForm],
      providers: [provideReservationFormTesting(reservationId), provideHttpTesting()],
    }).compileComponents();

    form = TestBed.inject(ProjectFormService);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProjectReservationListForm);
    element = fixture.nativeElement;
    await flushLookups();
    await fixture.whenStable();
  };

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(() => setup(null));

    it('starts with one project that cannot be removed', () => {
      expect(projects().length).toBe(1);
      expect(removeButtons()[0].disabled).toBe(true);
    });

    it('adds projects and allows removing them once there is more than one', async () => {
      getButton(element, 'Dodaj projekat')!.click();
      await fixture.whenStable();

      expect(projects().length).toBe(2);
      expect(removeButtons().every((button) => !button.disabled)).toBe(true);

      removeButtons()[1].click();
      await fixture.whenStable();
      expect(projects().length).toBe(1);
      expect(form.reservationModel().projectsToDelete).toEqual([]);
    });

    it('picking a subject stores both its id and its name', async () => {
      subjectSelect(0).value = '2';
      subjectSelect(0).dispatchEvent(new Event('change'));
      await fixture.whenStable();

      expect(projects()[0]).toEqual(
        expect.objectContaining({ subjectId: 2, subjectName: 'Web programiranje' }),
      );
      expect(element.textContent).toContain('Web programiranje');
    });

    it('picking a project type changes only that project', async () => {
      getButton(element, 'Dodaj projekat')!.click();
      await fixture.whenStable();

      Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
        .filter((button) => button.textContent?.includes('Diplomski'))[1]
        .click();
      await fixture.whenStable();

      expect(projects().map((project) => project.projectType)).toEqual([
        ProjectType.Seminar,
        ProjectType.Graduation,
      ]);
    });

    it('adds a trimmed note on Enter, clears the input and ignores empty notes', async () => {
      typeInto(noteInputs()[0], '  Dodati ER dijagram  ');
      noteInputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await fixture.whenStable();

      expect(projects()[0].notes.map(({ id, content }) => ({ id, content }))).toEqual([
        { id: 0, content: 'Dodati ER dijagram' },
      ]);
      expect(noteInputs()[0].value).toBe('');

      typeInto(noteInputs()[0], '   ');
      getButton(element, 'Dodaj')!.click();
      await fixture.whenStable();
      expect(projects()[0].notes.length).toBe(1);
    });
  });

  describe('on the details page', () => {
    beforeEach(async () => {
      await setup('7');
      const details = createProjectReservationDetails();
      expectReservationDetailsRequest().flush({
        ...details,
        projects: [details.projects[0], { ...details.projects[0], id: 22, notes: [] }],
      });
      await settle();
      await fixture.whenStable();
    });

    it('removing a saved project marks it for deletion', async () => {
      removeButtons()[0].click();
      await fixture.whenStable();

      expect(projects().map((project) => project.id)).toEqual([22]);
      expect(form.reservationModel().projectsToDelete).toEqual([21]);
    });

    it('removing a saved note marks it for deletion on its own project', async () => {
      element.querySelector<HTMLButtonElement>('button[aria-label="Ukloni belešku"]')!.click();
      await fixture.whenStable();

      expect(projects()[0].notes).toEqual([]);
      expect(projects()[0].notesToDelete).toEqual([31]);
      expect(projects()[1].notesToDelete).toEqual([]);
    });
  });
});
