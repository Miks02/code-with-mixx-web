import { Component, computed, input, output } from '@angular/core';
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

  entries = computed(() => Object.entries(this.options()) as [T, string][]);

  onSelect(event: Event) {
    this.sortChanged.emit((event.target as HTMLSelectElement).value as T);
  }
}
