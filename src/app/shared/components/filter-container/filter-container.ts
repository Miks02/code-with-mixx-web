import {
  Component,
  ElementRef,
  computed,
  contentChildren,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import {
  FILTER_CONTAINER,
  FilterMenu,
  FilterVariant,
} from '@shared/components/filter-menu/filter-menu';

type TriggerClasses = {
  background: string;
  border: string;
  icon: string;
};

const TRIGGER_CLASSES: Record<FilterVariant, TriggerClasses> = {
  default: {
    background: 'bg-emerald-700',
    border: 'border-emerald-400',
    icon: 'text-emerald-300!',
  },
  light: { background: 'bg-emerald-700', border: 'border-emerald-400', icon: 'text-emerald-300!' },
  blue: { background: 'bg-sky-700', border: 'border-sky-400', icon: 'text-sky-300!' },
};

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({ faSolidFilter, faSolidXmark }),
    { provide: FILTER_CONTAINER, useExisting: FilterContainer },
  ],
  selector: 'app-filter-container',
  styleUrl: './filter-container.css',
  templateUrl: './filter-container.html',
  host: { class: 'contents' },
})
export class FilterContainer {
  private filters = contentChildren(FilterMenu, { descendants: true });
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  variant = input<FilterVariant>('default');

  isOpen = signal(false);

  triggerClasses = computed(() => TRIGGER_CLASSES[this.variant()]);

  hasActiveFilters = computed(() => this.filters().some((filter) => filter.selected().length > 0));

  triggerBorder = computed(() => {
    const { background, border } = this.triggerClasses();
    const active = this.isOpen() || this.hasActiveFilters();
    return `${background} ${active ? 'border-amber-500' : border}`;
  });

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
