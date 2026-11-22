import { Component, ElementRef, computed, contentChildren, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { FILTER_CONTAINER, FilterMenu } from '@shared/components/filter-menu/filter-menu';

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({ faSolidFilter, faSolidXmark }),
    { provide: FILTER_CONTAINER, useValue: true },
  ],
  selector: 'app-filter-container',
  styleUrl: './filter-container.css',
  templateUrl: './filter-container.html',
  host: { class: 'contents' },
})
export class FilterContainer {
  private filters = contentChildren(FilterMenu, { descendants: true });
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  isOpen = signal(false);

  hasActiveFilters = computed(() => this.filters().some((filter) => filter.selected().length > 0));

  triggerBorder = computed(() =>
    this.isOpen() || this.hasActiveFilters() ? 'border-amber-500' : 'border-emerald-400',
  );

  open() {
    this.dialog().nativeElement.showModal();
    this.isOpen.set(true);
  }

  close() {
    this.dialog().nativeElement.close();
  }

  onClosed() {
    this.isOpen.set(false);
  }
}
