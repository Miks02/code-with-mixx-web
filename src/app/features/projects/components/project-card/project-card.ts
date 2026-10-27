import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import {
  faSolidCalendarDays,
  faSolidCalendarPlus,
  faSolidComment,
  faSolidDownload,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '../../../../core/utilities/price-helpers';
import { ProjectListItem } from '../../models/project-reservation-item';
import { PROJECT_TYPE_LABELS } from '../../utilities/project-labels';

@Component({
  imports: [NgIcon, DatePipe],
  providers: [
    provideIcons({
      faSolidCalendarDays,
      faSolidCalendarPlus,
      faSolidComment,
      faBrandGithub,
      faSolidDownload,
    }),
  ],
  selector: 'app-project-card',
  styleUrl: './project-card.css',
  templateUrl: './project-card.html',
})
export class ProjectCard {
  project = input.required<ProjectListItem>();
  clicked = output<void>();

  projectTypeLabel = computed(() => PROJECT_TYPE_LABELS[this.project().projectType]);
  priceLabel = computed(() => priceConverter(this.project().price));
  progress = computed(() => Math.min(100, Math.max(0, this.project().progress)));
  notesCount = computed(() => this.project().notesCount);

  onClick() {
    this.clicked.emit();
  }
}
