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

export type PagedListLayout = 'two-column' | 'single-column';

@Component({
  host: {
    class:
      'relative flex flex-col gap-3 bg-emerald-950/80 backdrop-blur-xl p-4 rounded-lg shadow-lg min-h-115',
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
  layout = input<PagedListLayout>('two-column');

  previousPage = output<void>();
  nextPage = output<void>();

  protected skeletonItems = Array.from({ length: 8 });

  protected gridClasses = computed(
    () =>
      `absolute inset-0 grid grid-cols-1 content-start gap-3 overflow-y-auto ${
        this.layout() === 'two-column' ? 'sm:grid-cols-2' : ''
      }`,
  );

  protected isEmpty = computed(() => this.page()?.totalCount === 0);
  protected shownCount = computed(() => this.page()?.paginatedCount ?? 0);
  protected totalCount = computed(() => this.page()?.totalCount ?? 0);
  protected currentPage = computed(() => this.page()?.pageNumber ?? 1);
  protected totalPages = computed(() => Math.max(this.page()?.totalPages ?? 1, 1));
  protected hasPreviousPage = computed(() => this.page()?.hasPreviousPage ?? false);
  protected hasNextPage = computed(() => this.page()?.hasNextPage ?? false);
}
