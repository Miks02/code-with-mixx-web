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
import { faSolidArrowDownWideShort, faSolidChevronDown } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidArrowDownWideShort, faSolidChevronDown })],
  selector: 'app-sort-menu',
  styleUrl: './sort-menu.css',
  templateUrl: './sort-menu.html',
})
export class SortMenu<T extends string = string> {
  options = input.required<Record<T, string>>();
  selected = input<T | undefined>(undefined);

  sortChanged = output<T>();

  private elementRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  private closeController: AbortController | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();

      if (isOpen) {
        this.closeController = new AbortController();

        const { signal } = this.closeController;

        document.addEventListener('click', (event) => this.onDocumentClick(event), {
          signal,
        });
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

  selectedLabel = computed(() => {
    const selected = this.selected();
    const options = this.options();
    if (selected && options[selected]) {
      return options[selected];
    }
    const [first] = this.entries();
    return first ? first[1] : '';
  });

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  close() {
    this.isOpen.set(false);
  }

  selectOption(value: T) {
    this.sortChanged.emit(value);
    this.close();
  }

  onDocumentClick(event: Event) {
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
