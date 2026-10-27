import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import {
  faSolidBoxArchive,
  faSolidCheck,
  faSolidCircleExclamation,
  faSolidComment,
  faSolidDownload,
  faSolidMoneyBillWave,
  faSolidPlus,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '../../../../../core/services/toast-service';
import { Button } from '../../../../../shared/components/button/button';
import { Slider } from '../../../../../shared/components/slider/slider';
import {
  createUpdateProjectForm,
  createUpdateProjectFormModel,
} from '../../../factories/project-factories';
import { UpdateProjectFormModel } from '../../../models/update-project-request';
import { ProjectService } from '../../../services/project-service';
import { PROJECT_RESERVATION_ERROR_MESSAGES } from '../../../utilities/project-error-messages';
import { PROJECT_TYPE_LABELS } from '../../../utilities/project-labels';

@Component({
  imports: [NgIcon, Button, FormField, Slider],
  providers: [
    provideIcons({
      faBrandGithub,
      faSolidBoxArchive,
      faSolidCheck,
      faSolidCircleExclamation,
      faSolidComment,
      faSolidDownload,
      faSolidMoneyBillWave,
      faSolidPlus,
      faSolidXmark,
    }),
  ],
  selector: 'app-project-edit-modal',
  styleUrl: './project-edit-modal.css',
  templateUrl: './project-edit-modal.html',
})
export class ProjectEditModal {
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  projectId = input<number>(0);
  reservationId = input.required<number>();
  closed = output<void>();

  private projectDetailsQuery = this.projectService.getProjectDetailsQuery(this.projectId);
  project = computed(() => this.projectDetailsQuery.data());
  isLoading = this.projectDetailsQuery.isLoading;
  isError = computed(() => this.projectDetailsQuery.isError());

  readOnlyReason = computed(() => {
    const project = this.project();
    if (project?.isReservationArchived)
      return 'Rezervacija je arhivirana, pa se projekat ne može menjati.';
    if (project?.isDeleted) return 'Projekat je arhiviran i ne može se menjati.';
    return null;
  });
  isReadOnly = computed(() => !this.project() || this.readOnlyReason() !== null);
  projectTypeLabel = computed(() => {
    const project = this.project();
    return project ? PROJECT_TYPE_LABELS[project.projectType] : '';
  });

  skeletonRows = [0, 1];

  private loadedProjectId = computed(() => this.project()?.id ?? 0);

  projectModel = linkedSignal<number, UpdateProjectFormModel>({
    source: this.loadedProjectId,
    computation: () => createUpdateProjectFormModel(untracked(this.projectDetailsQuery.data)),
  });
  projectForm = createUpdateProjectForm(this.projectModel, this.isReadOnly);
  updateProjectMutation = this.projectService.updateProjectMutation;

  newNote = signal('');

  onNewNoteInput(event: Event) {
    this.newNote.set((event.target as HTMLInputElement).value);
  }

  addNote() {
    const content = this.newNote().trim();
    if (!content || this.isReadOnly()) return;

    this.projectModel.update((model) => ({
      ...model,
      notes: [...model.notes, { id: 0, content }],
    }));
    this.newNote.set('');
  }

  removeNote(noteIndex: number) {
    if (this.isReadOnly()) return;

    this.projectModel.update((model) => {
      const noteToDelete = model.notes[noteIndex];
      if (!noteToDelete) return model;

      return {
        ...model,
        notes: model.notes.filter((_, index) => index !== noteIndex),
        notesToDelete: noteToDelete.id
          ? [...model.notesToDelete, noteToDelete.id]
          : model.notesToDelete,
      };
    });
  }

  onClose() {
    this.closed.emit();
  }

  onSubmit() {
    if (this.isReadOnly()) return;

    return submit(this.projectForm, async () => {
      const model = this.projectModel();

      try {
        await this.updateProjectMutation.mutateAsync({
          projectId: this.projectId(),
          reservationId: this.reservationId(),
          request: {
            price: model.price,
            progress: model.progress,
            githubLink: model.githubLink.trim() || null,
            downloadLink: model.downloadLink.trim() || null,
            notesToDelete: model.notesToDelete,
            notesToAdd: model.notes
              .filter((note) => note.id === 0)
              .map((note) => note.content.trim()),
          },
        });
        this.toastService.showSuccess('Projekat je uspešno ažuriran.');
        this.closed.emit();

        return [];
      } catch (err: any) {
        this.toastService.showError(
          PROJECT_RESERVATION_ERROR_MESSAGES[err?.error?.errorCode] ??
            'Došlo je do greške prilikom ažuriranja projekta. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
