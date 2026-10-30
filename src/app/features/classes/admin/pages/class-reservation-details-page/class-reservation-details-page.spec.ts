import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ToastService } from '@core/services/toast-service';
import { StudentLookup, StudentService } from '@features/students';
import { SubjectLookupItem, SubjectService } from '@features/subjects';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassReservationDetails } from '@features/classes/models/class-reservation-details';
import { ProblemDetails } from '@core/models/problem-details';
import { ClassService } from '@features/classes/services/class-service';
import { CLASS_RESERVATION_ERROR_MESSAGES } from '@features/classes/utilities/class-error-messages';
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

  const DETAILS: ClassReservationDetails = {
    id: 7,
    studentId: '',
    studentFullName: 'Marko Marković',
    studentEmail: 'marko.markovic@example.com',
    studentUniversity: null,
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.PartiallyPaid,
    totalPrice: 3900,
    paidAmount: 1300,
    discountRate: 0,
    bonus: 0,
    description: 'Priprema za kolokvijum iz OOP-a.',
    reservedAt: '2026-10-18',
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: null,
    classes: [
      { startsAt: '2026-11-03T10:00:00', endsAt: '2026-11-03T10:45:00' },
      { startsAt: '2026-11-03T10:50:00', endsAt: '2026-11-03T11:35:00' },
      { startsAt: '2026-11-03T11:40:00', endsAt: '2026-11-03T12:25:00' },
    ].map((times, index) => ({
      id: index + 1,
      subjectId: 1,
      subjectName: 'Objektno orijentisano programiranje',
      price: 1300,
      reservedAt: '2026-10-20',
      ...times,
    })),
  };

  const details = signal<ClassReservationDetails | undefined>(undefined);
  const classService = {
    getClassReservationDetailsQuery: vi.fn((_: Signal<number>) => ({ data: details })),
    updateClassReservationMutation: { mutateAsync: vi.fn(), isPending: signal(false) },
  };

  function problem(errorCode: string, status = 409): ProblemDetails {
    return { type: '', title: '', status, detail: '', errorCode };
  }

  function text(): string {
    return harness.routeNativeElement!.textContent ?? '';
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    details.set(DETAILS);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'admin/classes/details/:id', component: ClassReservationDetailsPage },
        ]),
        { provide: StudentService, useValue: studentService },
        { provide: SubjectService, useValue: subjectService },
        { provide: ToastService, useValue: toastService },
        { provide: ClassService, useValue: classService },
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

  it('should query the details for the reservation id from the route', () => {
    const [reservationId] = classService.getClassReservationDetailsQuery.mock.calls[0];

    expect(component.reservationId()).toBe(7);
    expect(reservationId()).toBe(7);
  });

  it('should keep the form as is while details are unavailable', () => {
    formService.reservationForm.description().value.set('Izmenjen opis');

    details.set(undefined);
    harness.detectChanges();

    expect(formService.reservationModel().description).toBe('Izmenjen opis');
  });

  it('should render the breadcrumb and the page sections', () => {
    const el = harness.routeNativeElement!;

    expect(text()).toContain('Detalji rezervacije');
    expect(el.querySelector('a[href="/admin/classes"]')).not.toBeNull();
    expect(el.querySelector('app-student-selection')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-pricing')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-list-form')).not.toBeNull();
    expect(el.querySelector('app-class-reservation-summary')).not.toBeNull();
  });

  describe('form model', () => {
    it('should populate the form from the reservation details', () => {
      const model = formService.reservationModel();

      expect(model.totalPrice).toBe(DETAILS.totalPrice);
      expect(model.reservationStatus).toBe(DETAILS.reservationStatus);
      expect(model.description).toBe(DETAILS.description);
      expect(model.classes).toHaveLength(DETAILS.classes.length);
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

    it('should use the reservation date from the details', () => {
      expect(formService.reservationModel().reservedAt).toBe('2026-10-18');
    });

    it('should show the paid amount from the details', () => {
      const paid = harness.routeNativeElement!.querySelector<HTMLInputElement>(
        '#reservation-paid-amount',
      )!;

      expect(paid.value).toBe(String(DETAILS.paidAmount));
    });

    it('should list the reservation classes in the summary', () => {
      expect(text()).toContain(`Časovi (${DETAILS.classes.length})`);
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
    const mutateAsync = classService.updateClassReservationMutation.mutateAsync;

    it('should not send the update while no student is selected', async () => {
      await component.onSubmit();

      expect(mutateAsync).not.toHaveBeenCalled();
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should send the update request built from the form', async () => {
      mutateAsync.mockResolvedValue(undefined);
      component.onStudentSelected(students[0]);
      formService.removeClass(2);
      formService.addClass();
      formService.updateClass(2, { subjectId: 1 });

      await component.onSubmit();

      const [request] = mutateAsync.mock.calls[0];
      expect(request).toMatchObject({
        id: 7,
        studentId: 'student-1',
        totalPrice: DETAILS.totalPrice,
        reservationStatus: DETAILS.reservationStatus,
        description: DETAILS.description,
        classesToDelete: [3],
      });
      expect(request.classes.map((c: { id: number }) => c.id)).toEqual([1, 2, 0]);
      expect(request.classes[0]).toEqual({
        id: 1,
        subjectId: 1,
        price: 1300,
        startsAt: new Date('2026-11-03T10:00').toISOString(),
        endsAt: new Date('2026-11-03T10:45').toISOString(),
        reservedAt: '2026-10-20',
      });
    });

    it('should send a null total price so the backend sums class prices', async () => {
      mutateAsync.mockResolvedValue(undefined);
      component.onStudentSelected(students[0]);
      formService.reservationForm.totalPrice().value.set(null);

      await component.onSubmit();

      expect(mutateAsync.mock.calls[0][0].totalPrice).toBeNull();
    });

    it('should show a success toast and go back to classes after saving', async () => {
      mutateAsync.mockResolvedValue(undefined);
      component.onStudentSelected(students[0]);

      await component.onSubmit();

      expect(toastService.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno ažurirana.');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/classes');
    });

    it('should show the message for a known error code and stay on the page', async () => {
      mutateAsync.mockRejectedValue(problem('Reservation.CantUpdateAnArchivedReservation'));
      component.onStudentSelected(students[0]);

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalledWith(
        CLASS_RESERVATION_ERROR_MESSAGES['Reservation.CantUpdateAnArchivedReservation'],
      );
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not toast an error the interceptor already handles', async () => {
      mutateAsync.mockRejectedValue(problem('General.InternalServerError', 500));
      component.onStudentSelected(students[0]);

      await component.onSubmit();

      expect(toastService.showError).not.toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
