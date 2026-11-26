import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import {
  faSolidCalendarCheck,
  faSolidCalendarDays,
  faSolidCalendarPlus,
  faSolidDownload,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { Badge } from '@shared/components/badge/badge';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { ProjectDetailsItem } from '@features/projects/models/project-reservation-details';
import { PROJECT_TYPE_LABELS } from '@features/projects/utilities/project-labels';

@Component({
  imports: [Badge, NgIcon, SrDatePipe],
  providers: [
    provideIcons({
      faBrandGithub,
      faSolidCalendarCheck,
      faSolidCalendarDays,
      faSolidCalendarPlus,
      faSolidDownload,
    }),
  ],
  selector: 'app-project-details-card',
  templateUrl: './project-details-card.html',
})
export class ProjectDetailsCard {
  project = input.required<Omit<ProjectDetailsItem, 'notesToDelete'>>();

  protected typeLabel = computed(() => PROJECT_TYPE_LABELS[this.project().projectType]);
  protected priceLabel = computed(() => priceConverter(this.project().price));
  protected progress = computed(() => Math.min(100, Math.max(0, this.project().progress)));
}
