import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { ReservationCheck } from '@features/reservations';
import {
  ProjectItemFormModel,
  ProjectReservationFormModel,
} from '../models/project-reservation-request';
import {
  createEmptyProject,
  createEmptyReservation,
  createProjectReservationFormFactory,
  createProjectReservationRequest,
  createUpdateProjectReservationRequest,
} from '../factories/project-factories';
import { getProjectReservationErrorMessage } from '../utilities/project-error-messages';
import { ProjectService } from './project-service';

@Service()
export class ProjectFormService {
  reservationModel: WritableSignal<ProjectReservationFormModel> = signal(createEmptyReservation());

  reservationForm = createProjectReservationFormFactory(this.reservationModel);

  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  itemsTotal = computed(() =>
    this.reservationModel().projects.reduce((sum, project) => sum + project.price, 0),
  );
  totalPrice = computed(() => this.reservationModel().totalPrice || 0);

  checks = computed<ReservationCheck[]>(() => {
    const projects = this.reservationModel().projects;

    return [
      {
        isValid: this.reservationForm.studentId().valid(),
        validLabel: 'Student je izabran',
        invalidLabel: 'Student nije izabran',
      },
      {
        isValid: projects.length > 0,
        validLabel: 'Rezervacija ima bar jedan projekat',
        invalidLabel: 'Rezervacija nema nijedan projekat',
      },
      {
        isValid: this.reservationForm.projects().valid(),
        validLabel: 'Polja svih projekata su ispravna',
        invalidLabel: 'Neka polja projekata nisu ispravna',
      },
      {
        isValid: projects.every((project) => project.subjectId !== 0),
        validLabel: 'Svi projekti imaju izabrani predmet.',
        invalidLabel: 'Svi projekti moraju imati izabrani predmet.',
      },
    ];
  });

  save(reservationId: number | null) {
    return submit(this.reservationForm, async () => {
      const model = this.reservationModel();

      try {
        if (reservationId !== null) {
          await this.projectService.updateProjectReservationMutation.mutateAsync(
            createUpdateProjectReservationRequest(model),
          );
          this.toastService.showSuccess('Rezervacija je uspešno ažurirana.');
        } else {
          await this.projectService.createProjectReservationMutation.mutateAsync(
            createProjectReservationRequest(model),
          );
          this.toastService.showSuccess('Rezervacija je uspešno kreirana.');
        }
        this.router.navigateByUrl('/admin/projects');
      } catch (err) {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }

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

    const deletedProjects = projectToDelete.id
      ? [...this.reservationModel().projectsToDelete, projectToDelete.id]
      : [...this.reservationModel().projectsToDelete];

    this.reservationModel.update((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, index) => index !== projectIndex),
      projectsToDelete: deletedProjects,
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
    const project = this.reservationModel().projects[projectIndex];
    const noteToDelete = project?.notes[noteIndex];
    if (!noteToDelete) return;

    this.updateProject(projectIndex, {
      notes: project.notes.filter((_, index) => index !== noteIndex),
      notesToDelete: noteToDelete.id
        ? [...project.notesToDelete, noteToDelete.id]
        : project.notesToDelete,
    });
  }
}
