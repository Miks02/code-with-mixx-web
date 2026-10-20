import { Service, signal, WritableSignal } from '@angular/core';
import {
  ProjectItemFormModel,
  ProjectReservationFormModel,
} from '../models/project-reservation-request';
import {
  createEmptyProject,
  createEmptyReservation,
  createProjectReservationFormFactory,
} from '../factories/project-factories';

@Service()
export class ProjectFormService {
  reservationModel: WritableSignal<ProjectReservationFormModel> = signal(createEmptyReservation());

  reservationForm = createProjectReservationFormFactory(this.reservationModel);

  addProject() {
    this.reservationModel.update((prev) => ({
      ...prev,
      projects: [...prev.projects, createEmptyProject()],
    }));
  }

  reset() {
    this.reservationModel.set(createEmptyReservation());
    this.reservationForm().reset();
  }

  removeProject(projectIndex: number) {
    if (this.reservationModel().projects.length <= 1) return;

    const projectToDelete = this.reservationModel().projects.find(
      (_, index) => index === projectIndex,
    )!;
    
    this.reservationModel.update((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, index) => index !== projectIndex),
      projectsToDelete: [...prev.projectsToDelete, projectToDelete.id],
    }));
  }

  updateProject(projectIndex: number, changes: Partial<ProjectItemFormModel>) {
    this.reservationModel.update((prev) => ({
      ...prev,
      projects: prev.projects.map((project, index) =>
        index === projectIndex ? { ...project, ...changes } : project,
      ),
    }));
  }

  addNote(projectIndex: number, note: string) {
    const notes = this.reservationModel().projects[projectIndex].notes;
    this.updateProject(projectIndex, { notes: [...notes, { id: 0, content: note }] });
  }

  removeNote(projectIndex: number, noteIndex: number) {
    const notes = this.reservationModel().projects[projectIndex].notes;
    if (notes.length < 1) return;
    
    const noteToDelete = this.reservationModel().projects[projectIndex].notes[noteIndex];
    if(!noteToDelete) return;

    this.reservationModel.update((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => ({
        ...project,
        notes: project.notes.filter((note) => note.id !== noteToDelete.id),
        notesToDelete: [...project.notesToDelete, noteToDelete.id]
      }))
    }));
  }
}
