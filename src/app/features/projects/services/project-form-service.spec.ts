import { TestBed } from '@angular/core/testing';
import { ProjectItemFormModel } from '../models/project-reservation-request';
import { ProjectFormService } from './project-form-service';
import { createEmptyProject } from '../factories/project-factories';

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
    TestBed.configureTestingModule({});
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
});
