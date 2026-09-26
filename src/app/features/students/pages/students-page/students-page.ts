import { Component, computed, signal, inject, effect } from '@angular/core';
import { AccountStatus } from '../../../../core/models/account-status';
import { StudentFilter } from '../../models/student-filter';
import { StudentItem } from '../../models/student-item';
import { StudentSort } from '../../models/student-sort';
import { StudentsSummary } from '../../models/students-summary';
import { StudentsList } from '../../components/students-list/students-list';
import { StudentDetails } from '../../components/student-details/student-details';
import { StudentQueryParams } from '../../models/student-query-params';
import { StudentService } from '../../services/student-service';
import { BehaviorSubject, debounceTime, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidUserCheck,
  faSolidUserClock,
  faSolidUserSlash,
  faSolidUserXmark,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '../../../../shared/stats-card/stats-card';
import { MostActiveStudent } from '../../components/most-active-student/most-active-student';

@Component({
  imports: [StudentsList, StudentDetails, StatsCard, MostActiveStudent],
  providers: [
    provideIcons({ faSolidUserCheck, faSolidUserClock, faSolidUserSlash, faSolidUserXmark }),
  ],
  selector: 'app-students-page',
  styleUrl: './students-page.css',
  templateUrl: './students-page.html',
})
export class StudentsPage {
  private studentService = inject(StudentService);

  private searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private searchTerm = toSignal(this.searchTerm$.pipe(debounceTime(300)), { initialValue: '' });

  constructor() {
    effect(() => {
      const searchTerm = this.searchTerm();

      if(!searchTerm) return;
      
      this.queryParams.update((params) => ({ ...params, searchTerm }));
    })
  }

  protected queryParams = signal<StudentQueryParams>({
    pageNumber: 1,
    pageSize: 15,
    searchTerm: '',
    sortBy: StudentSort.CreatedAscending,
    filters: [],
    includeDeleted: false,
  });

  private studentsSummarySource = this.studentService.getStudentsSummaryQuery(this.queryParams);
  private studentsSource = this.studentService.getPagedStudentsQuery(
    this.queryParams,
    this.studentsSummarySource,
  );

  studentsSummaryData = computed(() => this.studentsSummarySource.data());
  studentsData = computed(() => this.studentsSource.data());
  studentsSummaryPending = computed(() => this.studentsSummarySource.isPending());
  mostActiveStudent = computed(() => this.studentsSummaryData()?.mostActiveStudent ?? null);

  protected readonly selectedStudent = signal<StudentItem | undefined>(undefined);

  onSearchChange(term: string) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1 }));
    this.searchTerm$.next(term);
  }

  onSortChange(sort: StudentSort) {
    this.queryParams.update((params) => ({ ...params, sortBy: sort }));
  }

  onFilterChange(filters: StudentFilter[]) {
    this.queryParams.update((params) => ({ ...params, filters }));
  }

  onDeleteToggle(includeDeleted: boolean) {
    this.queryParams.update((params) => ({ ...params, includeDeleted }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }

  onStudentDeleted() {
    this.selectedStudent.set(undefined);
  }

  onStudentUpdated(student: StudentItem) {
    this.selectedStudent.set(student);
  }
}
