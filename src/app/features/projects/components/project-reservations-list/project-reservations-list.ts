import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidPlus,
  faSolidUserSlash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '../../../../core/models/paged-result';
import { Button } from '../../../../shared/button/button';
import { FilterMenu } from '../../../../shared/filter-menu/filter-menu';
import { Skeleton } from '../../../../shared/skeleton/skeleton';
import { ReservationStatus } from '../../../reservations';
import { ProjectReservationItem } from '../../models/project-reservation-item';
import { ProjectType } from '../../models/project-type';
import { ProjectReservationCard } from '../project-reservation-card/project-reservation-card';

const CONFLICTING_RESERVATION_STATUSES: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.Confirmed]: [ReservationStatus.Cancelled],
  [ReservationStatus.Completed]: [ReservationStatus.Cancelled],
  [ReservationStatus.Cancelled]: [ReservationStatus.Confirmed, ReservationStatus.Completed],
};

@Component({
  imports: [ProjectReservationCard, Button, FilterMenu, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidPlus,
      faSolidUserSlash,
      faSolidXmark,
    }),
  ],
  selector: 'app-project-reservations-list',
  styleUrl: './project-reservations-list.css',
  templateUrl: './project-reservations-list.html',
})
export class ProjectReservationsList {
  pagedReservations = input.required<PagedResult<ProjectReservationItem> | undefined>();
  selectedReservationId = input<number | undefined>(undefined);
  selectedProjectTypes = input<ProjectType[]>([]);
  selectedReservationStatuses = input<ReservationStatus[]>([]);
  showOnlyDeletedStudents = input<boolean>(false);
  isPending = input<boolean>(false);
  isFetching = input<boolean>(false);

  conflictingReservationStatuses = CONFLICTING_RESERVATION_STATUSES;

  reservationSelected = output<ProjectReservationItem | undefined>();
  pageChanged = output<number>();
  projectTypesChanged = output<ProjectType[]>();
  reservationStatusesChanged = output<ReservationStatus[]>();
  deletedStudentsToggled = output<boolean>();
  openCreationForm = output<void>();

  reservations = computed(() => this.pagedReservations()?.items);
  skeletonItems = computed(() => Array.from({ length: 6 }));
  totalCount = computed(() => this.pagedReservations()?.totalCount ?? 0);
  paginatedCount = computed(() => this.pagedReservations()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedReservations()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedReservations()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedReservations()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedReservations()?.hasNextPage ?? false);

  projectTypes: Record<ProjectType, string> = {
    [ProjectType.Seminar]: 'Seminarski',
    [ProjectType.Graduation]: 'Diplomski',
  };

  reservationStatuses: Record<ReservationStatus, string> = {
    [ReservationStatus.Confirmed]: 'Potvrđene',
    [ReservationStatus.Completed]: 'Završene',
    [ReservationStatus.Cancelled]: 'Otkazane',
  };

  onReservationSelected(reservation: ProjectReservationItem | undefined) {
    this.reservationSelected.emit(reservation);
  }

  onProjectTypesChanged(projectTypes: ProjectType[]) {
    this.projectTypesChanged.emit(projectTypes);
  }

  onReservationStatusesChanged(reservationStatuses: ReservationStatus[]) {
    this.reservationStatusesChanged.emit(reservationStatuses);
  }

  onDeletedStudentsToggle() {
    this.deletedStudentsToggled.emit(!this.showOnlyDeletedStudents());
  }

  onOpenCreationForm() {
    this.openCreationForm.emit();
  }

  onPreviousPage() {
    if (!this.hasPreviousPage()) return;
    this.pageChanged.emit(this.currentPage() - 1);
  }

  onNextPage() {
    if (!this.hasNextPage()) return;
    this.pageChanged.emit(this.currentPage() + 1);
  }
}
