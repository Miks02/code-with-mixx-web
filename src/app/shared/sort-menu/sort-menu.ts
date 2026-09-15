import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowDownWideShort, faSolidChevronDown } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidArrowDownWideShort, faSolidChevronDown })],
  selector: 'app-sort-menu',
  styleUrl: './sort-menu.css',
  templateUrl: './sort-menu.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SortMenu<T extends string = string> {
  options = input.required<Record<T, string>>();
  selected = input<T | undefined>(undefined);

  sortChanged = output<T>();

  private elementRef = inject(ElementRef<HTMLElement>);

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
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
