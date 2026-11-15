import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '@core/models/paged-result';
import { Button } from '@shared/components/button/button';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { ReservationType } from '@features/reservations';
import { StudentReservation } from '@features/students/models/student-details';
import { StudentReservationCard } from '../student-reservation-card/student-reservation-card';

export type ReservationTypeFilter = ReservationType | 'All';

const TYPE_FILTER_OPTIONS: Record<ReservationTypeFilter, string> = {
  All: 'Sve rezervacije',
  [ReservationType.Class]: 'Časovi',
  [ReservationType.Project]: 'Projekti',
};

@Component({
  imports: [NgIcon, Button, Skeleton, SortMenu, StudentReservationCard],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight, faSolidXmark })],
  selector: 'app-student-reservations-list',
  styleUrl: './student-reservations-list.css',
  templateUrl: './student-reservations-list.html',
})
export class StudentReservationsList {
  pagedReservations = input<PagedResult<StudentReservation>>();
  selectedType = input<ReservationTypeFilter>('All');
  isPending = input<boolean>(false);
  isFetching = input<boolean>(false);

  typeChanged = output<ReservationTypeFilter>();
  pageChanged = output<number>();

  readonly typeOptions = TYPE_FILTER_OPTIONS;
  readonly skeletonItems = Array.from({ length: 4 });

  reservations = computed(() => this.pagedReservations()?.items ?? []);
  paginatedCount = computed(() => this.pagedReservations()?.paginatedCount ?? 0);
  totalCount = computed(() => this.pagedReservations()?.totalCount ?? 0);
  currentPage = computed(() => this.pagedReservations()?.pageNumber ?? 1);
  totalPages = computed(() => Math.max(this.pagedReservations()?.totalPages ?? 1, 1));
  hasPreviousPage = computed(() => this.pagedReservations()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedReservations()?.hasNextPage ?? false);

  onPreviousPage() {
    if (this.hasPreviousPage()) this.pageChanged.emit(this.currentPage() - 1);
  }

  onNextPage() {
    if (this.hasNextPage()) this.pageChanged.emit(this.currentPage() + 1);
  }
}
