import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCheck,
  faSolidChevronDown,
  faSolidFilter,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidCheck, faSolidChevronDown, faSolidFilter, faSolidXmark })],
  selector: 'app-filter-menu',
  styleUrl: './filter-menu.css',
  templateUrl: './filter-menu.html',
})
export class FilterMenu<T extends string = string> {
  options = input.required<Record<T, string>>();
  conflictingOptions = input<Record<T, T[]>>();
  selected = input<T[]>([]);
  placeholder = input<string>('Filteri');

  selectedChanged = output<T[]>();

  private elementRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  private closeController: AbortController | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();

      if (isOpen) {
        this.closeController = new AbortController();
        const { signal } = this.closeController;

        document.addEventListener('click', (event) => this.onDocumentClick(event), { signal });
        document.addEventListener('keydown', (event) => this.onDocumentKeydown(event), {
          signal,
        });
      } else {
        this.closeController?.abort();
        this.closeController = null;
      }
    });

    this.destroyRef.onDestroy(() => this.closeController?.abort());
  }

  isOpen = signal(false);

  entries = computed(() => Object.entries(this.options()) as [T, string][]);

  disabledOptions = computed(() => {
    const selected = this.selected();
    return selected.flatMap((value) => this.conflictingOptions()?.[value] ?? []);
  });

  selectedLabel = computed(() => {
    const selected = this.selected();
    if (selected.length === 0) {
      return this.placeholder();
    }
    if (selected.length === 1) {
      return this.options()[selected[0]] ?? this.placeholder();
    }
    return `${this.placeholder()} (${selected.length})`;
  });

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  close() {
    this.isOpen.set(false);
  }

  isSelected(value: T) {
    return this.selected().includes(value);
  }

  isDisabled(value: T) {
    return this.disabledOptions().includes(value);
  }

  optionClasses(value: T) {
    if (this.isDisabled(value)) {
      return 'text-emerald-100/30 cursor-not-allowed opacity-60';
    }
    return this.isSelected(value)
      ? 'bg-emerald-800 text-emerald-100 cursor-pointer'
      : 'text-emerald-100/80 hover:bg-emerald-900 cursor-pointer';
  }

  toggleOption(value: T) {
    if (this.isDisabled(value)) return;

    const selected = this.selected();
    this.selectedChanged.emit(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );
  }

  private onDocumentClick(event: Event) {
    if (!event.composedPath().includes(this.elementRef.nativeElement)) {
      this.close();
    }
  }

  private onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
