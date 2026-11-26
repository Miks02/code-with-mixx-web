import { Component, computed, input, output } from '@angular/core';
import { PagedResult } from '@core/models/paged-result';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { Skeleton } from '@shared/components/skeleton/skeleton';

@Component({
  host: {
    class:
      'relative flex flex-col gap-3 bg-emerald-950/80 backdrop-blur-xl p-4 rounded-lg shadow-lg',
  },
  imports: [Button, NgIcon, Skeleton],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight, faSolidXmark })],
  selector: 'app-paged-list',
  templateUrl: './paged-list.html',
})
export class PagedList {
  title = input.required<string>();
  page = input<PagedResult<unknown>>();
  isPending = input(false);
  emptyMessage = input('Nije pronađen nijedan rezultat.');

  previousPage = output<void>();
  nextPage = output<void>();

  protected skeletonItems = Array.from({ length: 8 });

  protected isEmpty = computed(() => this.page()?.totalCount === 0);
  protected shownCount = computed(() => this.page()?.paginatedCount ?? 0);
  protected totalCount = computed(() => this.page()?.totalCount ?? 0);
  protected currentPage = computed(() => this.page()?.pageNumber ?? 1);
  protected totalPages = computed(() => Math.max(this.page()?.totalPages ?? 1, 1));
  protected hasPreviousPage = computed(() => this.page()?.hasPreviousPage ?? false);
  protected hasNextPage = computed(() => this.page()?.hasNextPage ?? false);
}
