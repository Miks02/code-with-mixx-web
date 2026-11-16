import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronLeft, faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { SubjectCard } from '@features/subjects/components/subject-card/subject-card';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { AdminSubjectsStore } from '@features/subjects/admin/stores/admin-subject-store';

@Component({
  imports: [SubjectCard, Button, SearchBar, SortMenu, NgIcon, Skeleton],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
  selector: 'app-admin-subject-list',
  styleUrl: './admin-subject-list.css',
  templateUrl: './admin-subject-list.html',
})
export class AdminSubjectList {
  private store = inject(AdminSubjectsStore);

  selectedSubjectId = computed(() => this.store.selectedSubject()?.id);
  selectedSort = this.store.params.sortBy;
  showOnlyArchived = this.store.params.onlyArchived;
  isPending = this.store.subjectsPending;
  isFetching = this.store.subjectsFetching;

  private pagedSubjects = this.store.pagedSubjects;
  subjects = computed(() => this.pagedSubjects()?.items);
  skeletonItems = computed(() => Array.from({ length: 6 }));
  totalCount = computed(() => this.pagedSubjects()?.totalCount ?? 0);
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
    this.store.selectSubject(subject);
  }

  onSearchInput(searchTerm: string) {
    this.store.setSearchTerm(searchTerm);
  }

  onSortChanged(sort: SubjectSort) {
    this.store.setSort(sort);
  }

  onArchivedToggle() {
    this.store.setOnlyArchived(!this.showOnlyArchived());
  }

  onPreviousPage() {
    if (!this.hasPreviousPage()) return;
    this.store.setPageNumber(this.currentPage() - 1);
  }

  onNextPage() {
    if (!this.hasNextPage()) return;
    this.store.setPageNumber(this.currentPage() + 1);
  }
}
