import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '@features/students';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidUserXmark } from '@ng-icons/font-awesome/solid';

const MAX_RESULTS = 8;

@Component({
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidUserXmark })],
  selector: 'app-student-lookup',
  templateUrl: './student-lookup.html',
})
export class StudentLookup {
  private studentService = inject(StudentService);
  private router = inject(Router);
  private injector = inject(Injector);

  private studentsLookupQuery = this.studentService.getStudentsLookupQuery();
  private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  searchString = signal('');
  isOpen = signal(false);
  isMobileOpen = signal(false);
  activeIndex = signal(-1);

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
        this.isMobileOpen.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  onSearchFocusOut(event: FocusEvent) {
    const container = event.currentTarget as HTMLElement;
    if (container.contains(event.relatedTarget as Node | null)) return;

    this.isOpen.set(false);
    this.isMobileOpen.set(false);
  }

  toggleMobile() {
    if (this.isMobileOpen()) {
      this.isMobileOpen.set(false);
      this.isOpen.set(false);
      return;
    }

    this.isMobileOpen.set(true);
    afterNextRender(() => this.searchInput().nativeElement.focus(), { injector: this.injector });
  }

  onStudentSelected() {
    this.searchString.set('');
    this.activeIndex.set(-1);
    this.isOpen.set(false);
    this.isMobileOpen.set(false);
  }
}
