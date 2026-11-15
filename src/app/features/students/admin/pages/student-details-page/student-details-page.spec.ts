import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AccountStatus } from '@core/models/account-status';
import { ProblemDetails } from '@core/models/problem-details';
import { ReservationType } from '@features/reservations';
import {
  StudentDetailsQueryParams,
  StudentDetailsResponse,
} from '@features/students/models/student-details';
import { StudentService } from '@features/students/services/student-service';
import { StudentDetailsPage } from './student-details-page';

const DETAILS: StudentDetailsResponse = {
  student: {
    id: 'student-1',
    firstName: 'Ana',
    lastName: 'Anić',
    email: 'ana@example.com',
    phoneNumber: null,
    university: null,
    accountStatus: AccountStatus.Active,
    registeredAt: '2026-09-01T10:00:00Z',
    lastLoginAt: null,
    deletedAt: null,
  },
  stats: {
    totalReservations: 4,
    classReservations: 3,
    projectReservations: 1,
    totalClasses: 9,
    totalProjects: 1,
    overdueReservations: 1,
    totalPrice: 15600,
    totalPaid: 9100,
    totalRemaining: 6500,
  },
  reservations: {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    paginatedCount: 0,
  },
};

describe('StudentDetailsPage', () => {
  let harness: RouterTestingHarness;
  let component: StudentDetailsPage;

  const data = signal<StudentDetailsResponse | undefined>(undefined);
  const error = signal<ProblemDetails | null>(null);
  const isPending = signal(false);

  let studentIdArg: Signal<string>;
  let paramsArg: Signal<StudentDetailsQueryParams>;

  const studentService = {
    getStudentDetailsQuery: vi.fn(
      (studentId: Signal<string>, params: Signal<StudentDetailsQueryParams>) => {
        studentIdArg = studentId;
        paramsArg = params;
        return { data, error, isPending, isFetching: signal(false) };
      },
    ),
  };

  function text(): string {
    return harness.routeNativeElement!.textContent ?? '';
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    data.set(DETAILS);
    error.set(null);
    isPending.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'admin/students/details/:id', component: StudentDetailsPage }]),
        { provide: StudentService, useValue: studentService },
      ],
    });

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(
      '/admin/students/details/student-1',
      StudentDetailsPage,
    );
  });

  it('should query details for the student id from the route', () => {
    expect(studentService.getStudentDetailsQuery).toHaveBeenCalledTimes(1);
    expect(studentIdArg()).toBe('student-1');
    expect(paramsArg()).toEqual({ pageNumber: 1, pageSize: 10, reservationType: null });
  });

  it('should render the profile, stats and reservations list', () => {
    expect(text()).toContain('Ana Anić');
    expect(text()).toContain('Rezervacije');
    expect(text()).toContain('Kasni uplata');
    expect(text()).toContain('U 3 rezervacija');
    expect(
      harness.routeNativeElement!.querySelector('app-student-reservations-list'),
    ).not.toBeNull();
  });

  it('should filter by type and reset to the first page', () => {
    component.onPageChange(3);
    component.onTypeChange(ReservationType.Project);

    expect(paramsArg()).toEqual({
      pageNumber: 1,
      pageSize: 10,
      reservationType: ReservationType.Project,
    });
    expect(component.selectedType()).toBe(ReservationType.Project);
  });

  it('should clear the type filter when "All" is selected', () => {
    component.onTypeChange(ReservationType.Class);
    component.onTypeChange('All');

    expect(paramsArg().reservationType).toBeNull();
    expect(component.selectedType()).toBe('All');
  });

  it('should change the page', () => {
    component.onPageChange(2);
    expect(paramsArg().pageNumber).toBe(2);
  });

  it('should show the not found state for Student.NotFound', () => {
    data.set(undefined);
    error.set({ type: '', title: '', status: 404, detail: '', errorCode: 'Student.NotFound' });
    harness.detectChanges();

    expect(text()).toContain('Student nije pronađen.');
    expect(harness.routeNativeElement!.querySelector('app-student-profile')).toBeNull();
  });

  it('should keep the layout for other errors', () => {
    data.set(undefined);
    error.set({ type: '', title: '', status: 0, detail: '', errorCode: 'Network.Unavailable' });
    harness.detectChanges();

    expect(text()).not.toContain('Student nije pronađen.');
    expect(harness.routeNativeElement!.querySelector('app-student-profile')).not.toBeNull();
  });
});
