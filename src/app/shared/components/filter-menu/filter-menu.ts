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

export type FilterVariant = 'default' | 'blue';

type FilterClasses = {
  trigger: string;
  triggerText: string;
  icon: string;
  menu: string;
  optionIdle: string;
  optionSelected: string;
  optionDisabled: string;
  mobileTrigger: string;
  mobileTriggerBorder: string;
  mobileIcon: string;
};

const FILTER_CLASSES: Record<FilterVariant, FilterClasses> = {
  default: {
    trigger: 'bg-emerald-900/80',
    triggerText: 'text-emerald-100',
    icon: 'text-emerald-400!',
    menu: 'bg-emerald-950',
    optionIdle: 'text-emerald-100/80 hover:bg-emerald-900 cursor-pointer',
    optionSelected: 'bg-emerald-800 text-emerald-100 cursor-pointer',
    optionDisabled: 'text-emerald-100/30 cursor-not-allowed opacity-60',
    mobileTrigger: 'bg-emerald-700',
    mobileTriggerBorder: 'border-emerald-400',
    mobileIcon: 'text-emerald-300!',
  },
  blue: {
    trigger: 'bg-sky-900/80',
    triggerText: 'text-sky-100',
    icon: 'text-sky-400!',
    menu: 'bg-sky-900',
    optionIdle: 'text-sky-100/80 hover:bg-sky-800/60 cursor-pointer',
    optionSelected: 'bg-sky-800 text-sky-100 cursor-pointer',
    optionDisabled: 'text-sky-100/30 cursor-not-allowed opacity-60',
    mobileTrigger: 'bg-sky-700',
    mobileTriggerBorder: 'border-sky-400',
    mobileIcon: 'text-sky-300!',
  },
};

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
  icon = input<string>('fa-solid-filter');
  variant = input<FilterVariant>('default');

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

  classes = computed(() => FILTER_CLASSES[this.variant()]);

  mobileTriggerClasses = computed(() => {
    const classes = this.classes();
    const border =
      this.isOpen() || this.selected().length ? 'border-amber-500' : classes.mobileTriggerBorder;
    return `${classes.mobileTrigger} ${border}`;
  });

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
    const classes = this.classes();
    if (this.isDisabled(value)) {
      return classes.optionDisabled;
    }
    return this.isSelected(value) ? classes.optionSelected : classes.optionIdle;
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
