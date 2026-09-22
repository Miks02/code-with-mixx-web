import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidCalendarCheck,
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidDiagramProject,
  faSolidUserSlash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '../../../../core/models/paged-result';
import { Button } from '../../../../shared/button/button';
import { FilterMenu } from '../../../../shared/filter-menu/filter-menu';
import { SearchBar } from '../../../../shared/search-bar/search-bar';
import { Skeleton } from '../../../../shared/skeleton/skeleton';
import { SortMenu } from '../../../../shared/sort-menu/sort-menu';
import { StudentFilter } from '../../models/student-filter';
import { StudentItem } from '../../models/student-item';
import { StudentSort } from '../../models/student-sort';
import { StudentCard } from '../student-card/student-card';

const CONFLICTING_FILTERS: Record<StudentFilter, StudentFilter[]> = {
  [StudentFilter.WithClasses]: [StudentFilter.WithoutClasses],
  [StudentFilter.WithoutClasses]: [StudentFilter.WithClasses],
  [StudentFilter.WithProjects]: [StudentFilter.WithoutProjects],
  [StudentFilter.WithoutProjects]: [StudentFilter.WithProjects],
};

@Component({
  imports: [StudentCard, Button, SearchBar, SortMenu, FilterMenu, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidCalendarCheck,
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidDiagramProject,
      faSolidUserSlash,
      faSolidXmark,
    }),
  ],
  selector: 'app-students-list',
  styleUrl: './students-list.css',
  templateUrl: './students-list.html',
})
export class StudentsList {
  pagedStudents = input.required<PagedResult<StudentItem> | undefined>();
  selectedStudentId = input<string | undefined>(undefined);
  selectedSort = input<StudentSort>(StudentSort.CreatedAscending);
  selectedFilters = input<StudentFilter[]>([]);
  showOnlyDeleted = input<boolean>(false);
  isPending = input<boolean>(false);
  isFetching = input<boolean>(false);

  conflictingFilters = CONFLICTING_FILTERS;

  studentSelected = output<StudentItem>();
  searchChanged = output<string>();
  pageChanged = output<number>();
  sortChanged = output<StudentSort>();
  filtersChanged = output<StudentFilter[]>();
  deletedToggled = output<boolean>();

  students = computed(() => this.pagedStudents()?.items);
  skeletonItems = computed(() => Array.from({ length: 6 }));
  totalCount = computed(() => this.pagedStudents()?.totalCount ?? 0);
  pageSize = computed(() => this.pagedStudents()?.pageSize ?? 0);
  paginatedCount = computed(() => this.pagedStudents()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedStudents()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedStudents()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedStudents()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedStudents()?.hasNextPage ?? false);

  sort: Record<StudentSort, string> = {
    [StudentSort.NameAscending]: 'Po imenu (A-Z)',
    [StudentSort.NameDescending]: 'Po imenu (Z-A)',
    [StudentSort.CreatedAscending]: 'Po datumu - stariji',
    [StudentSort.CreatedDescending]: 'Po datumu - noviji',
    [StudentSort.TotalReservationAscending]: 'Po rezervacijama - manje',
    [StudentSort.TotalReservationDescending]: 'Po rezervacijama - više',
  };

  filters: Record<StudentFilter, string> = {
    [StudentFilter.WithClasses]: 'Sa časovima',
    [StudentFilter.WithoutClasses]: 'Bez časova',
    [StudentFilter.WithProjects]: 'Sa projektima',
    [StudentFilter.WithoutProjects]: 'Bez projekata',
  };

  onStudentSelected(student: StudentItem) {
    this.studentSelected.emit(student);
  }

  onSearchInput(searchTerm: string) {
    this.searchChanged.emit(searchTerm);
  }

  onSortChanged(sort: StudentSort) {
    this.sortChanged.emit(sort);
  }

  onFiltersChanged(filters: StudentFilter[]) {
    this.filtersChanged.emit(filters);
  }

  onDeletedToggle() {
    this.deletedToggled.emit(!this.showOnlyDeleted());
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
