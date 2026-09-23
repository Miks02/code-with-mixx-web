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

@Component({
  imports: [StudentsList, StudentDetails],
  selector: 'app-students-page',
  styleUrl: './students-page.css',
  templateUrl: './students-page.html',
})
export class StudentsPage {
  protected readonly studentsSummary = signal<StudentsSummary>({
    activeStudents: 11,
    deletedStudents: 1,
    pagedStudents: {
      items: [
        {
          id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
          firstName: 'Marko',
          lastName: 'Jovanović',
          email: 'marko.jovanovic@example.com',
          phoneNumber: '+381601234567',
          university: 'Elektrotehnički fakultet',
          totalReservations: 14,
          totalClasses: 12,
          totalProjects: 3,
          registeredAt: '2025-09-15T10:24:00Z',
          deletedAt: null,
          accountStatus: AccountStatus.Active,
        },
        {
          id: '6f1e2a3c-5b7d-4c8e-9a0b-1c2d3e4f5a6b',
          firstName: 'Ana',
          lastName: 'Petrović',
          email: 'ana.petrovic@example.com',
          phoneNumber: '+381612345678',
          university: 'Fakultet tehničkih nauka',
          totalReservations: 9,
          totalClasses: 8,
          totalProjects: 2,
          registeredAt: '2025-10-02T14:05:00Z',
          deletedAt: null,
          accountStatus: AccountStatus.Pending,
        },
        {
          id: '2c4d6e8f-1a3b-4c5d-8e7f-9a0b1c2d3e4f',
          firstName: 'Nikola',
          lastName: 'Ilić',
          email: 'nikola.ilic@example.com',
          phoneNumber: '+381623456789',
          university: null,
          totalReservations: 5,
          totalClasses: 4,
          totalProjects: 1,
          registeredAt: '2025-11-20T09:40:00Z',
          deletedAt: null,
          accountStatus: AccountStatus.Active,
        },
        {
          id: '9e8d7c6b-5a4f-4e3d-b2c1-0a9b8c7d6e5f',
          firstName: 'Jelena',
          lastName: 'Stojanović',
          email: 'jelena.stojanovic@example.com',
          phoneNumber: '+381634567890',
          university: 'Matematički fakultet',
          totalReservations: 7,
          totalClasses: 6,
          totalProjects: 2,
          registeredAt: '2026-01-11T16:30:00Z',
          deletedAt: null,
          accountStatus: AccountStatus.Active,
        },
        {
          id: '3a5b7c9d-2e4f-4a6b-8c0d-1e3f5a7b9c1d',
          firstName: 'Stefan',
          lastName: 'Nikolić',
          email: 'stefan.nikolic@example.com',
          phoneNumber: '+381645678901',
          university: 'Fakultet organizacionih nauka',
          totalReservations: 3,
          totalClasses: 2,
          totalProjects: 0,
          registeredAt: '2026-02-03T11:15:00Z',
          deletedAt: '2026-06-18T08:00:00Z',
          accountStatus: AccountStatus.Deleted,
        },
      ],
      totalCount: 12,
      pageNumber: 1,
      pageSize: 5,
      totalPages: 3,
      hasPreviousPage: false,
      hasNextPage: true,
      paginatedCount: 5,
    },
    mostActiveStudent: {
      id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
      firstName: 'Marko',
      lastName: 'Jovanović',
      email: 'marko.jovanovic@example.com',
      phoneNumber: '+381601234567',
      university: 'Elektrotehnički fakultet',
      totalReservations: 14,
      totalClasses: 12,
      totalProjects: 3,
      registeredAt: '2025-09-15T10:24:00Z',
      accountStatus: AccountStatus.Active,
    },
  });

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
}
