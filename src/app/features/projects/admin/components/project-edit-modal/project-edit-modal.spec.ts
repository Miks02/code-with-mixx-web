import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../../../../core/services/toast-service';
import { ProjectDetails } from '../../../models/project-details';
import { ProjectType } from '../../../models/project-type';
import { ProjectService } from '../../../services/project-service';
import { ProjectEditModal } from './project-edit-modal';

describe('ProjectEditModal', () => {
  let component: ProjectEditModal;
  let fixture: ComponentFixture<ProjectEditModal>;

  const details = signal<ProjectDetails | undefined>(undefined);
  const isLoading = signal(false);
  const isError = signal(false);

  const updateProjectMutation = {
    mutateAsync: vi.fn(),
    isPending: signal(false),
  };
  const projectService = {
    updateProjectMutation,
    getProjectDetailsQuery: vi.fn(() => ({
      data: details,
      isLoading,
      isError: () => isError(),
    })),
  };
  const toastService = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  function createDetails(changes: Partial<ProjectDetails> = {}): ProjectDetails {
    return {
      id: 5,
      reservationId: 9,
      subjectId: 1,
      subjectName: 'Algoritmi',
      projectType: ProjectType.Seminar,
      price: 3000,
      progress: 40,
      githubLink: null,
      downloadLink: null,
      reservedAt: '2026-10-01',
      startDate: '2026-10-02',
      endDate: '2026-10-20',
      isDeleted: false,
      isReservationArchived: false,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: null,
      notes: [
        { id: 11, content: 'Prva beleška', createdAt: '2026-10-01T10:00:00Z', updatedAt: null },
        { id: 12, content: 'Druga beleška', createdAt: '2026-10-02T10:00:00Z', updatedAt: null },
      ],
      ...changes,
    };
  }

  function load(project: ProjectDetails | undefined) {
    isLoading.set(false);
    details.set(project);
    fixture.detectChanges();
  }

  function notesOf(notes: { id: number; content: string }[]) {
    return notes.map(({ id, content }) => ({ id, content }));
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    details.set(undefined);
    isLoading.set(true);
    isError.set(false);

    await TestBed.configureTestingModule({
      imports: [ProjectEditModal],
      providers: [
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectEditModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectId', 5);
    fixture.componentRef.setInput('reservationId', 9);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('loading', () => {
    it('should request details for the given project id', () => {
      const [projectId] = projectService.getProjectDetailsQuery.mock.calls[0] as unknown as [
        () => number,
      ];
      expect(projectId()).toBe(5);
    });

    it('should show a skeleton and no form while loading', () => {
      expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
      expect(text()).not.toContain('Sačuvaj');
    });

    it('should show an error message when loading fails', () => {
      isError.set(true);
      load(undefined);

      expect(text()).toContain('Nije moguće učitati projekat');
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should build the model once details arrive', () => {
      load(createDetails());

      const { notes, ...model } = component.projectModel();
      expect(model).toEqual({
        price: 3000,
        progress: 40,
        githubLink: '',
        downloadLink: '',
        notesToDelete: [],
      });
      expect(notesOf(notes)).toEqual([
        { id: 11, content: 'Prva beleška' },
        { id: 12, content: 'Druga beleška' },
      ]);
      expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
      expect(text()).toContain('Algoritmi');
    });

    it('should not share note objects with the cached details', () => {
      const project = createDetails();
      load(project);

      expect(component.projectModel().notes[0]).not.toBe(project.notes[0]);
      expect(Object.getOwnPropertySymbols(project.notes[0])).toEqual([]);
    });

    it('should keep edits when the same project is refetched', () => {
      load(createDetails());
      component.projectModel.update((model) => ({ ...model, progress: 90 }));

      load(createDetails({ subjectName: 'Osvežen' }));

      expect(component.projectModel().progress).toBe(90);
    });
  });

  describe('notes', () => {
    beforeEach(() => load(createDetails()));

    it('should add a trimmed new note and clear the input', () => {
      component.newNote.set('  Nova beleška  ');
      component.addNote();

      expect(notesOf(component.projectModel().notes).at(-1)).toEqual({
        id: 0,
        content: 'Nova beleška',
      });
      expect(component.newNote()).toBe('');
    });

    it('should ignore an empty note', () => {
      component.newNote.set('   ');
      component.addNote();

      expect(component.projectModel().notes.length).toBe(2);
    });

    it('should mark an existing note for deletion', () => {
      component.removeNote(0);

      expect(notesOf(component.projectModel().notes)).toEqual([
        { id: 12, content: 'Druga beleška' },
      ]);
      expect(component.projectModel().notesToDelete).toEqual([11]);
    });

    it('should remove only the selected new note without marking it for deletion', () => {
      component.newNote.set('A');
      component.addNote();
      component.newNote.set('B');
      component.addNote();

      component.removeNote(2);

      expect(component.projectModel().notes.map((n) => n.content)).toEqual([
        'Prva beleška',
        'Druga beleška',
        'B',
      ]);
      expect(component.projectModel().notesToDelete).toEqual([]);
    });
  });

  describe.each([
    ['archived project', { isDeleted: true }, 'Projekat je arhiviran'],
    ['archived reservation', { isReservationArchived: true }, 'Rezervacija je arhivirana'],
  ])('%s', (_, changes, message) => {
    beforeEach(() => load(createDetails(changes)));

    it('should be read-only with a disabled form', () => {
      expect(component.isReadOnly()).toBe(true);
      expect(component.projectForm().disabled()).toBe(true);
      expect(text()).toContain(message);
      expect(text()).not.toContain('Sačuvaj');
    });

    it('should not change notes', () => {
      component.removeNote(0);
      component.newNote.set('Nova');
      component.addNote();

      expect(component.projectModel().notes.length).toBe(2);
      expect(component.projectModel().notesToDelete).toEqual([]);
    });

    it('should not submit', async () => {
      await component.onSubmit();

      expect(updateProjectMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    let closedSpy: ReturnType<typeof vi.fn<() => void>>;

    beforeEach(() => {
      load(createDetails());
      closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);
    });

    it('should send changes, show success toast and close', async () => {
      updateProjectMutation.mutateAsync.mockResolvedValue(undefined);
      component.projectModel.update((model) => ({
        ...model,
        price: 3500,
        progress: 75,
        githubLink: ' https://github.com/mixx/repo ',
      }));
      component.removeNote(1);
      component.newNote.set('Dodata beleška');
      component.addNote();

      await component.onSubmit();

      expect(updateProjectMutation.mutateAsync).toHaveBeenCalledWith({
        projectId: 5,
        reservationId: 9,
        request: {
          price: 3500,
          progress: 75,
          githubLink: 'https://github.com/mixx/repo',
          downloadLink: null,
          notesToDelete: [12],
          notesToAdd: ['Dodata beleška'],
        },
      });
      expect(toastService.showSuccess).toHaveBeenCalledWith('Projekat je uspešno ažuriran.');
      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should show mapped error message and stay open when mutation fails', async () => {
      updateProjectMutation.mutateAsync.mockRejectedValue({
        error: { errorCode: 'Reservation.CantUpdateAnArchivedReservation' },
      });

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalledWith(
        'Nije moguće izmeniti projekat iz arhivirane rezervacije.',
      );
      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should not call mutation when progress is out of range', async () => {
      component.projectModel.update((model) => ({ ...model, progress: 120 }));

      await component.onSubmit();

      expect(component.projectForm.progress().errors()[0]?.message).toBe(
        'Napredak ne može biti veći od 100%.',
      );
      expect(updateProjectMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });
});
