import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { StudentLookup, StudentService } from '@features/students';
import { SubjectLookupItem, SubjectService } from '@features/subjects';
import { ProblemDetails } from '@core/models/problem-details';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassService } from '@features/classes/services/class-service';
import { CLASS_RESERVATION_ERROR_MESSAGES } from '@features/classes/utilities/class-error-messages';
import { CreateClassReservationPage } from './create-class-reservation-page';

describe('CreateClassReservationPage', () => {
  let component: CreateClassReservationPage;
  let fixture: ComponentFixture<CreateClassReservationPage>;
  let formService: ClassFormService;
  let router: Router;

  const students: StudentLookup[] = [
    { id: 'student-1', fullName: 'Ana Anić', email: 'ana@example.com' } as StudentLookup,
    { id: 'student-2', fullName: 'Petar Petrović', email: 'petar@example.com' } as StudentLookup,
  ];
  const subjects: SubjectLookupItem[] = [{ id: 1, subjectName: 'Algoritmi' }];

  const studentService = {
    getStudentsLookupQuery: { data: signal(students), isFetching: signal(false) },
  };
  const subjectService = {
    getSubjectsLookupQuery: () => ({ data: signal(subjects), isFetching: signal(false) }),
  };
  const toastService = { showSuccess: vi.fn(), showError: vi.fn() };
  const classService = {
    createClassReservationMutation: { mutateAsync: vi.fn(), isPending: signal(false) },
  };

  function problem(errorCode: string, status = 409): ProblemDetails {
    return { type: '', title: '', status, detail: '', errorCode };
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function makeValid() {
    component.onStudentSelected(students[0]);
    formService.updateClass(0, { subjectId: 1 });
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateClassReservationPage],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: SubjectService, useValue: subjectService },
        { provide: ToastService, useValue: toastService },
        { provide: ClassService, useValue: classService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClassReservationPage);
    component = fixture.componentInstance;
    formService = fixture.debugElement.injector.get(ClassFormService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide its own ClassFormService instance', () => {
    expect(formService).not.toBe(TestBed.inject(ClassFormService));
    expect(component.reservationModel).toBe(formService.reservationModel);
  });

  it('should render the breadcrumb and the page sections', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(text()).toContain('Nova rezervacija');
    expect(el.querySelector('a[href="/admin/classes"]')).not.toBeNull();
    expect(el.querySelector('app-student-selection')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-pricing')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-list-form')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-summary')).not.toBeNull();
  });

  it('should expose students and subjects from the lookup queries', () => {
    expect(component.availableStudents()).toEqual(students);
    expect(component.subjectsLookup()).toEqual(subjects);
  });

  describe('student selection', () => {
    it('should start without a selected student', () => {
      expect(component.selectedStudent()).toBeNull();
    });

    it('should store the selected student id in the form', () => {
      component.onStudentSelected(students[1]);
      fixture.detectChanges();

      expect(formService.reservationModel().studentId).toBe('student-2');
      expect(component.selectedStudent()).toEqual(students[1]);
      expect(text()).toContain('Petar Petrović');
    });

    it('should clear the student when selection is removed', () => {
      component.onStudentSelected(students[0]);
      component.onStudentSelected(null);

      expect(formService.reservationModel().studentId).toBe('');
      expect(component.selectedStudent()).toBeNull();
    });
  });

  describe('submit', () => {
    const mutateAsync = classService.createClassReservationMutation.mutateAsync;

    it('should not send an invalid reservation', async () => {
      await component.onSubmit();

      expect(mutateAsync).not.toHaveBeenCalled();
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should send the request built from the form', async () => {
      mutateAsync.mockResolvedValue(undefined);
      makeValid();
      formService.reservationForm.description().value.set('');

      await component.onSubmit();

      const model = formService.reservationModel();
      expect(mutateAsync).toHaveBeenCalledWith({
        studentId: 'student-1',
        totalPrice: null,
        reservedAt: model.reservedAt,
        description: null,
        reservationStatus: model.reservationStatus,
        classes: model.classes.map((c) => ({
          ...c,
          startsAt: new Date(c.startsAt).toISOString(),
          endsAt: new Date(c.endsAt).toISOString(),
        })),
      });
    });

    it('should show a success toast and go back to classes after saving', async () => {
      mutateAsync.mockResolvedValue(undefined);
      makeValid();

      await component.onSubmit();

      expect(toastService.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno kreirana.');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/classes');
    });

    it('should show the message for a known error code and stay on the page', async () => {
      mutateAsync.mockRejectedValue(problem('Reservation.ClassesOverlap', 400));
      makeValid();

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalledWith(
        CLASS_RESERVATION_ERROR_MESSAGES['Reservation.ClassesOverlap'],
      );
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not toast an error the interceptor already handles', async () => {
      mutateAsync.mockRejectedValue(problem('General.InternalServerError', 500));
      makeValid();

      await component.onSubmit();

      expect(toastService.showError).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
