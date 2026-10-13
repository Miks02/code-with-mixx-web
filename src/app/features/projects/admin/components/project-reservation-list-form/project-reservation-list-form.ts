import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidComment,
  faSolidPlus,
  faSolidTrash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '../../../../../core/utilities/price-helpers';
import { Button } from '../../../../../shared/button/button';
import { Slider } from '../../../../../shared/slider/slider';
import { SubjectLookupItem } from '../../../../subjects';
import { ProjectItemFormModel } from '../../../models/project-reservation-request';
import { ProjectType } from '../../../models/project-type';
import { ProjectFormService } from '../../../services/project-form-service';
import { PROJECT_TYPE_LABELS } from '../../../utilities/project-labels';

@Component({
  imports: [Button, NgIcon, FormField, Slider, NgTemplateOutlet],
  providers: [provideIcons({ faSolidPlus, faSolidTrash, faSolidXmark, faSolidComment })],
  selector: 'app-project-reservation-list-form',
  styleUrl: './project-reservation-list-form.css',
  templateUrl: './project-reservation-list-form.html',
})
export class ProjectReservationListForm {
  subjectsLookup = input.required<SubjectLookupItem[] | undefined>();

  projectFormService = inject(ProjectFormService);

  projects = computed(() => this.projectFormService.reservationModel().projects);
  projectsForm = this.projectFormService.reservationForm.projects;

  projectTypes = Object.values(ProjectType);
  projectTypeLabels = PROJECT_TYPE_LABELS;
  priceConverter = priceConverter;

  constructor() {
    if (!this.projects().length) this.addProject();
  }

  addProject() {
    this.projectFormService.addProject();
  }

  removeProject(projectIndex: number) {
    this.projectFormService.removeProject(projectIndex);
  }

  onSubjectChanged(projectIndex: number, event: Event) {
    const subjectId = Number((event.target as HTMLSelectElement).value);
    const subject = this.subjectsLookup()?.find((s) => s.id === subjectId);
    if (!subject) return;

    this.projectFormService.updateProject(projectIndex, {
      subjectId: subject.id,
      subjectName: subject.subjectName,
    });
  }

  onProjectTypeChanged(projectIndex: number, projectType: ProjectType) {
    this.projectFormService.updateProject(projectIndex, { projectType });
  }

  addNote(projectIndex: number, noteInput: HTMLInputElement) {
    const note = noteInput.value.trim();
    if (!note) return;

    this.projectFormService.addNote(projectIndex, note);
    noteInput.value = '';
  }

  removeNote(projectIndex: number, noteIndex: number) {
    this.projectFormService.removeNote(projectIndex, noteIndex);
  }
}
