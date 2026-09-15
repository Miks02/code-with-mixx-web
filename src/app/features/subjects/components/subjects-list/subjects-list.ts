import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidMagnifyingGlass,
} from '@ng-icons/font-awesome/solid';
import { PagedResult } from '../../../../core/models/paged-result';
import { Button } from '../../../../shared/button/button';
import { SubjectItem } from '../../models/subject-item';
import { SubjectCard } from '../subject-card/subject-card';
import { SearchBar } from '../../../../shared/search-bar/search-bar';

@Component({
  imports: [SubjectCard, Button, SearchBar],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
  selector: 'app-subjects-list',
  styleUrl: './subjects-list.css',
  templateUrl: './subjects-list.html',
})
export class SubjectsList {
  pagedSubjects = input.required<PagedResult<SubjectItem> | undefined>();
  selectedSubjectId = input<number | undefined>(undefined);

  subjectSelected = output<SubjectItem>();
  searchChanged = output<string>();
  pageChanged = output<number>();

  subjects = computed(() => this.pagedSubjects()?.items);
  totalCount = computed(() => this.pagedSubjects()?.totalCount ?? 0);
  pageSize = computed(() => this.pagedSubjects()?.pageSize ?? 0);
  paginatedCount = computed(() => this.pagedSubjects()?.paginatedCount ?? 0);
  currentPage = computed(() => this.pagedSubjects()?.pageNumber ?? 1);
  totalPages = computed(() => this.pagedSubjects()?.totalPages ?? 1);
  hasPreviousPage = computed(() => this.pagedSubjects()?.hasPreviousPage ?? false);
  hasNextPage = computed(() => this.pagedSubjects()?.hasNextPage ?? false);

  onSubjectSelected(subject: SubjectItem) {
    this.subjectSelected.emit(subject);
  }

  onSearchInput(searchTerm: string) {
    this.searchChanged.emit(searchTerm);
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
