import { Component, computed, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBarsProgress,
  faSolidCircleCheck,
  faSolidDiagramProject,
  faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '../../../../../shared/stats-card/stats-card';
import { ReservationStatus } from '../../../../reservations';
import { ProjectReservationsList } from '../../../components/project-reservations-list/project-reservations-list';
import { ProjectQueryParams } from '../../../models/project-query-params';
import { ProjectReservationItem } from '../../../models/project-reservation-item';
import { ProjectType } from '../../../models/project-type';
import { ProjectService } from '../../../services/project-service';
import { ProjectReservationDetails } from '../../components/project-reservation-details/project-reservation-details';

@Component({
  imports: [ProjectReservationsList, ProjectReservationDetails, StatsCard],
  providers: [
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
  private projectService = inject(ProjectService);

  protected queryParams = signal<ProjectQueryParams>({
    pageNumber: 1,
    pageSize: 15,
    projectTypes: [],
    reservationStatuses: [],
    showOnlyDeletedStudents: false,
  });

  private projectsSummarySource = this.projectService.getProjectsSummaryQuery(this.queryParams);
  private reservationsSource = this.projectService.getPagedProjectReservationsQuery(
    this.queryParams,
    this.projectsSummarySource,
  );

  projectsSummaryData = computed(() => this.projectsSummarySource.data());
  reservationsData = computed(() => this.reservationsSource.data());
  projectsSummaryPending = computed(() => this.projectsSummarySource.isPending());
  reservationsPending = computed(() => this.reservationsSource.isPending());
  reservationsFetching = computed(() => this.reservationsSource.isFetching());

  protected readonly selectedReservation = signal<ProjectReservationItem | undefined>(undefined);

  onReservationSelected(reservation: ProjectReservationItem | undefined) {
    this.selectedReservation.set(reservation);
  }

  onProjectTypesChange(projectTypes: ProjectType[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, projectTypes }));
  }

  onReservationStatusesChange(reservationStatuses: ReservationStatus[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, reservationStatuses }));
  }

  onDeletedStudentsToggle(showOnlyDeletedStudents: boolean) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, showOnlyDeletedStudents }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }
}
