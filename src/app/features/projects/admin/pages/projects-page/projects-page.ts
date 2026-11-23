import {
    Component,
    inject
} from '@angular/core';
import { AdminProjectReservationList } from '@features/projects/admin/components/admin-project-reservation-list/admin-project-reservation-list';
import { ProjectReservationDetails } from '@features/projects/admin/components/project-reservation-details/project-reservation-details';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import { provideIcons } from '@ng-icons/core';
import {
    faSolidBarsProgress,
    faSolidCircleCheck,
    faSolidDiagramProject,
    faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';

@Component({
  imports: [AdminProjectReservationList, ProjectReservationDetails, StatsCard, ScrollIntoViewOn],
  providers: [
    AdminProjectStore,
    provideIcons({
      faSolidBarsProgress,
      faSolidCircleCheck,
      faSolidDiagramProject,
      faSolidHourglassHalf,
    }),
  ],
  selector: 'app-projects-page',
  styleUrl: './projects-page.css',
  templateUrl: './projects-page.html',
})
export class ProjectsPage {
  protected store = inject(AdminProjectStore);
}
