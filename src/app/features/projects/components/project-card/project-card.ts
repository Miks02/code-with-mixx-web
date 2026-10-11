import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarDays, faSolidCalendarPlus } from '@ng-icons/font-awesome/solid';
import { priceConverter } from '../../../../core/utilities/price-helpers';
import { ProjectItem } from '../../models/project-item';
import { PROJECT_TYPE_LABELS } from '../../utilities/project-labels';

@Component({
  imports: [NgIcon, DatePipe],
  providers: [provideIcons({ faSolidCalendarDays, faSolidCalendarPlus })],
  selector: 'app-project-card',
  styleUrl: './project-card.css',
  templateUrl: './project-card.html',
})
export class ProjectCard {
  project = input.required<ProjectItem>();

  projectTypeLabel = computed(() => PROJECT_TYPE_LABELS[this.project().projectType]);
  priceLabel = computed(() => priceConverter(this.project().price));
  progress = computed(() => Math.min(100, Math.max(0, this.project().progress)));
}
