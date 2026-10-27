import { Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidMagnifyingGlass })],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  placeholder = input<string>('');
  searchTerm = output<string>();
  toggleSearchBar = output<void>();
  isVisible = signal<boolean>(false);

  onSearch(event: Event) {
    this.searchTerm.emit((event.target as HTMLInputElement).value);
  }

  onToggle() {
    this.isVisible.set(!this.isVisible());
  }
}
