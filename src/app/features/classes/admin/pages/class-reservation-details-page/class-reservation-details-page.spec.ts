import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ToastService } from '@core/services/toast-service';
import { StudentLookup, StudentService } from '@features/students';
import { SubjectLookupItem, SubjectService } from '@features/subjects';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { MOCK_CLASS_RESERVATION_DETAILS } from '@features/classes/utilities/class-mock-data';
import { ClassReservationDetailsPage } from './class-reservation-details-page';

describe('ClassReservationDetailsPage', () => {
  let harness: RouterTestingHarness;
  let component: ClassReservationDetailsPage;
  let formService: ClassFormService;
  let router: Router;

  const students: StudentLookup[] = [
    { id: 'student-1', fullName: 'Ana Anić', email: 'ana@example.com' } as StudentLookup,
  ];
  const subjects: SubjectLookupItem[] = [
    { id: 1, subjectName: 'Objektno orijentisano programiranje' },
  ];

  const studentService = {
    getStudentsLookupQuery: { data: signal(students), isFetching: signal(false) },
  };
  const subjectService = {
    getSubjectsLookupQuery: () => ({ data: signal(subjects), isFetching: signal(false) }),
  };
  const toastService = { showSuccess: vi.fn(), showError: vi.fn() };

  function text(): string {
    return harness.routeNativeElement!.textContent ?? '';
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'admin/classes/details/:id', component: ClassReservationDetailsPage },
        ]),
        { provide: StudentService, useValue: studentService },
        { provide: SubjectService, useValue: subjectService },
        { provide: ToastService, useValue: toastService },
      ],
    });

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(
      '/admin/classes/details/7',
      ClassReservationDetailsPage,
    );
    formService = harness.routeDebugElement!.injector.get(ClassFormService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    harness.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the reservation id from the route', () => {
    expect(component.reservationId()).toBe(7);
    expect(component.reservationDetails()?.id).toBe(7);
  });

  it('should render the breadcrumb and the page sections', () => {
    const el = harness.routeNativeElement!;

    expect(text()).toContain('Detalji rezervacije');
    expect(el.querySelector('a[href="/admin/classes"]')).not.toBeNull();
    expect(el.querySelector('app-student-selection')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-pricing')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-summary')).not.toBeNull();
  });

  describe('form model', () => {
    it('should populate the form from the reservation details', () => {
      const model = formService.reservationModel();

      expect(model.totalPrice).toBe(MOCK_CLASS_RESERVATION_DETAILS.totalPrice);
      expect(model.reservationStatus).toBe(MOCK_CLASS_RESERVATION_DETAILS.reservationStatus);
      expect(model.description).toBe(MOCK_CLASS_RESERVATION_DETAILS.description);
      expect(model.classes).toHaveLength(MOCK_CLASS_RESERVATION_DETAILS.classes.length);
      expect(model.classesToDelete).toEqual([]);
    });

    it('should convert class times to datetime-local values', () => {
      expect(formService.reservationModel().classes[0]).toMatchObject({
        subjectId: 1,
        price: 1300,
        startsAt: '2026-11-03T10:00',
        endsAt: '2026-11-03T10:45',
        reservedAt: '2026-10-20',
      });
    });

    it('should use the earliest class reservation date as the reservation date', () => {
      expect(formService.reservationModel().reservedAt).toBe('2026-10-20');
    });

    it('should show the paid amount from the details', () => {
      const paid = harness.routeNativeElement!.querySelector<HTMLInputElement>(
        '#reservation-paid-amount',
      )!;

      expect(paid.value).toBe(String(MOCK_CLASS_RESERVATION_DETAILS.paidAmount));
    });

    it('should list the reservation classes in the summary', () => {
      expect(text()).toContain(`Časovi (${MOCK_CLASS_RESERVATION_DETAILS.classes.length})`);
      expect(text()).toContain('Objektno orijentisano programiranje');
    });
  });

  describe('student selection', () => {
    it('should update the student and resolve it from the lookup', () => {
      component.onStudentSelected(students[0]);
      harness.detectChanges();

      expect(formService.reservationModel().studentId).toBe('student-1');
      expect(component.selectedStudent()).toEqual(students[0]);
    });
  });

  describe('submit', () => {
    it('should not save while no student is selected', async () => {
      await component.onSubmit();

      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should show a success toast and go back to classes for a valid reservation', async () => {
      component.onStudentSelected(students[0]);

      await component.onSubmit();

      expect(toastService.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno ažurirana.');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/classes');
    });
  });
});
