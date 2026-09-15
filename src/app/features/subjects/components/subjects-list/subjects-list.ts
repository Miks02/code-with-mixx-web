import { Component, computed, input, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidChevronLeft, faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { PagedResult } from '../../../../core/models/paged-result';
import { Button } from '../../../../shared/button/button';
import { SearchBar } from '../../../../shared/search-bar/search-bar';
import { SubjectItem } from '../../models/subject-item';
import { SubjectSort } from '../../models/subject-sort';
import { SubjectCard } from '../subject-card/subject-card';
import { SortMenu } from '../../../../shared/sort-menu/sort-menu';

@Component({
  imports: [SubjectCard, Button, SearchBar, SortMenu],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
  selector: 'app-subjects-list',
  styleUrl: './subjects-list.css',
  templateUrl: './subjects-list.html',
})
export class SubjectsList {
  pagedSubjects = input.required<PagedResult<SubjectItem> | undefined>();
  selectedSubjectId = input<number | undefined>(undefined);
  selectedSort = input<SubjectSort>(SubjectSort.CreatedAscending);

  subjectSelected = output<SubjectItem>();
  searchChanged = output<string>();
  pageChanged = output<number>();
  sortChanged = output<SubjectSort>();

  subjects = computed(() => this.pagedSubjects()?.items);
  totalCount = computed(() => this.pagedSubjects()?.totalCount ?? 0);
  pageSize = computed(() => this.pagedSubjects()?.pageSize ?? 0);
  paginatedCount = computed(() => this.pagedSubjects()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedSubjects()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedSubjects()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedSubjects()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedSubjects()?.hasNextPage ?? false);

  sort: Record<SubjectSort, string> = {
    [SubjectSort.NameAscending]: 'Po imenu (A-Z)',
    [SubjectSort.NameDescending]: 'Po imenu (Z-A)',
    [SubjectSort.CreatedAscending]: 'Po datumu - stariji',
    [SubjectSort.CreatedDescending]: 'Po datumu - noviji',
  };

  onSubjectSelected(subject: SubjectItem) {
    this.subjectSelected.emit(subject);
  }

  onSearchInput(searchTerm: string) {
    this.searchChanged.emit(searchTerm);
  }

  onSortChanged(sort: SubjectSort) {
    this.sortChanged.emit(sort);
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
