import { Service, signal, WritableSignal } from '@angular/core';
import {
  ProjectItemFormModel,
  ProjectReservationFormModel,
} from '../models/project-reservation-request';
import { createProjectReservationFormFactory } from '../factories/project-factories';
import { ReservationStatus } from '../../reservations';
import { ProjectType } from '../models/project-type';
import { dateInputValue } from '../../../core/utilities/date-helpers';

const DEFAULT_PROJECT_DURATION_DAYS = 7;

@Service()
export class ProjectFormService {
  projects: WritableSignal<ProjectItemFormModel[]> = signal([]);

  reservationModel: WritableSignal<ProjectReservationFormModel> = signal({
    studentId: '',
    paidAmount: 0,
    totalPrice: 0,
    progress: 0,
    reservationStatus: ReservationStatus.Confirmed,
    projects: [],
  });

  reservationForm = createProjectReservationFormFactory(this.reservationModel);

  addProject() {
    const newProject: ProjectItemFormModel = {
      id: 0,
      subjectId: 0,
      startDate: dateInputValue(),
      subjectName: '',
      endDate: dateInputValue(DEFAULT_PROJECT_DURATION_DAYS),
      githubLink: '',
      downloadLink: '',
      price: 0,
      progress: 0,
      projectType: ProjectType.Seminar,
      reservedAt: dateInputValue(),
      notes: [],
    };

    this.reservationModel.update((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  }

  removeProject(projectIndex: number) {
    if (this.reservationModel().projects.length <= 1) return;

    this.reservationModel.update((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, index) => index !== projectIndex),
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
    this.updateProject(projectIndex, { notes: [...notes, note] });
  }

  removeNote(projectIndex: number, noteIndex: number) {
    const notes = this.reservationModel().projects[projectIndex].notes;
    this.updateProject(projectIndex, { notes: notes.filter((_, index) => index !== noteIndex) });
  }
}
