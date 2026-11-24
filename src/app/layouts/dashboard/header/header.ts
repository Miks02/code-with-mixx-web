import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserState } from '@core/services/user-state';
import { StudentService } from '@features/students';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBars,
  faSolidBell,
  faSolidMagnifyingGlass,
  faSolidUser,
  faSolidUserXmark,
} from '@ng-icons/font-awesome/solid';

const MAX_RESULTS = 8;

@Component({
  imports: [NgIcon, RouterLink],
  providers: [
    provideIcons({
      faSolidMagnifyingGlass,
      faSolidUser,
      faSolidBell,
      faSolidBars,
      faSolidUserXmark,
    }),
  ],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  userState = inject(UserState);
  studentService = inject(StudentService);
  private router = inject(Router);
  private injector = inject(Injector);
  heading = input<string>();
  toggleSidebar = output<void>();

  private studentsLookupQuery = this.studentService.getStudentsLookupQuery();

  searchString = signal('');

  students = computed(() => {
    const search = this.searchString().toLowerCase();
    const all = this.studentsLookupQuery.data() ?? [];

    return all.filter(
      (s) => s.email.toLowerCase().includes(search) || s.fullName.toLowerCase().includes(search),
    );
  });

  results = computed(() =>
    this.searchString().trim() ? this.students().slice(0, MAX_RESULTS) : [],
  );

  private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  isOpen = signal(false);
  isMobileSearchOpen = signal(false);
  activeIndex = signal(-1);
  showResults = computed(() => this.isOpen() && !!this.searchString().trim());

  onSearchInput(value: string) {
    this.searchString.set(value);
    this.activeIndex.set(-1);
    this.isOpen.set(true);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const results = this.results();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        if (results.length) this.activeIndex.update((i) => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (results.length) this.activeIndex.update((i) => (i <= 0 ? results.length - 1 : i - 1));
        break;
      case 'Enter': {
        const student = results[this.activeIndex()] ?? (results.length === 1 ? results[0] : null);
        if (student) {
          event.preventDefault();
          this.router.navigate(['/admin/students/details', student.id]);
          this.onStudentSelected();
        }
        break;
      }
      case 'Escape':
        this.isOpen.set(false);
        this.isMobileSearchOpen.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  onSearchFocusOut(event: FocusEvent) {
    const container = event.currentTarget as HTMLElement;
    if (container.contains(event.relatedTarget as Node | null)) return;

    this.isOpen.set(false);
    this.isMobileSearchOpen.set(false);
  }

  onToggleMobileSearch() {
    if (this.isMobileSearchOpen()) {
      this.isMobileSearchOpen.set(false);
      this.isOpen.set(false);
      return;
    }

    this.isMobileSearchOpen.set(true);
    afterNextRender(() => this.searchInput().nativeElement.focus(), { injector: this.injector });
  }

  onStudentSelected() {
    this.searchString.set('');
    this.activeIndex.set(-1);
    this.isOpen.set(false);
    this.isMobileSearchOpen.set(false);
  }

  onOpenSidebar() {
    this.toggleSidebar.emit();
  }
}
