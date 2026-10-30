import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PAYMENT_STATUS_META, PaymentStatus } from '@features/reservations';
import { createEmptyClass } from '@features/classes/factories/class-factories';
import { ClassItemRequest } from '@features/classes/models/create-class-reservation-request';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationSummary } from './class-reservation-summary';

describe('ClassReservationSummary', () => {
  let component: ClassReservationSummary;
  let fixture: ComponentFixture<ClassReservationSummary>;
  let formService: ClassFormService;

  const subjectsLookup = [
    { id: 1, subjectName: 'Algoritmi' },
    { id: 2, subjectName: 'Baze podataka' },
  ];

  function createClass(changes: Partial<ClassItemRequest> = {}): ClassItemRequest {
    return { ...createEmptyClass(), subjectId: 1, price: 1300, ...changes };
  }

  function setClasses(classes: ClassItemRequest[], totalPrice: number | null = null) {
    formService.reservationModel.update((model) => ({ ...model, classes, totalPrice }));
    fixture.detectChanges();
  }

  function stat(label: string): string | undefined {
    return component.stats().find((s) => s.label === label)?.value;
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function button(label: string): HTMLButtonElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes(label))!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationSummary],
      providers: [ClassFormService],
    }).compileComponents();

    formService = TestBed.inject(ClassFormService);
    fixture = TestBed.createComponent(ClassReservationSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subjectsLookup', subjectsLookup);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pricing', () => {
    it('should use the classes sum as the total when total price is null', () => {
      setClasses([createClass(), createClass({ price: 1500 })]);

      expect(component.totalPrice()).toBe(2800);
      expect(stat('Ukupna cena')).toBe(component.priceConverter(2800));
    });

    it('should prefer a manually entered total price', () => {
      setClasses([createClass(), createClass()], 2000);

      expect(component.totalPrice()).toBe(2000);
    });

    it('should calculate a discount when the total is lower than the classes sum', () => {
      setClasses([createClass({ price: 1000 }), createClass({ price: 1000 })], 1500);

      expect(component.discountRate()).toBe(25);
      expect(stat('Popust')).toBe('25%');
    });

    it('should not show a discount when the total matches the classes sum', () => {
      setClasses([createClass()]);

      expect(stat('Popust')).toBeUndefined();
    });

    it('should show "Besplatno" for a zero total price', () => {
      setClasses([createClass()], 0);

      expect(stat('Ukupna cena')).toBe('Besplatno');
    });

    it('should show the remaining amount and hide "Plaćeno" when nothing is paid', () => {
      setClasses([createClass()]);

      expect(stat('Plaćeno')).toBeUndefined();
      expect(stat('Preostalo')).toBe(component.priceConverter(1300));
    });

    it('should show a bonus and hide the remaining amount on overpayment', () => {
      fixture.componentRef.setInput('totalPaid', 2000);
      setClasses([createClass()]);

      expect(stat('Bonus')).toBe(component.priceConverter(700));
      expect(stat('Preostalo')).toBeUndefined();
    });
  });

  describe('payment status', () => {
    beforeEach(() => setClasses([createClass()]));

    it.each([
      [0, PaymentStatus.Pending],
      [500, PaymentStatus.PartiallyPaid],
      [1300, PaymentStatus.Paid],
    ])('should be correct when %i RSD is paid', (paid, status) => {
      fixture.componentRef.setInput('totalPaid', paid);
      fixture.detectChanges();

      expect(component.paymentStatus()).toBe(PAYMENT_STATUS_META[status]);
      expect(text()).toContain(PAYMENT_STATUS_META[status].label);
    });
  });

  describe('classes list', () => {
    it('should list classes with their subject name and price', () => {
      setClasses([createClass({ subjectId: 1 }), createClass({ subjectId: 2, price: 1500 })]);

      expect(text()).toContain('Časovi (2)');
      expect(text()).toContain('Algoritmi');
      expect(text()).toContain('Baze podataka');
      expect(text()).toContain(component.priceConverter(1500));
    });

    it('should fall back to "Novi čas" when no subject is selected', () => {
      setClasses([createClass({ subjectId: 0 })]);

      expect(text()).toContain('Novi čas');
    });

    it('should show the class date and time range', () => {
      const classItem = createClass({ startsAt: '2026-11-03T10:00', endsAt: '2026-11-03T10:45' });
      setClasses([classItem]);

      expect(text()).toContain(component.timeConverter(classItem.startsAt));
      expect(text()).toContain(component.timeConverter(classItem.endsAt));
    });
  });

  describe('checks', () => {
    function check(validLabel: string) {
      return component.checks().find((c) => c.validLabel === validLabel)!;
    }

    it('should report a missing student', () => {
      setClasses([createClass()]);

      expect(check('Student je izabran').isValid).toBe(false);
      expect(text()).toContain('Student nije izabran');
    });

    it('should report a selected student', () => {
      formService.reservationForm.studentId().value.set('student-1');
      fixture.detectChanges();

      expect(check('Student je izabran').isValid).toBe(true);
    });

    it('should report classes without a subject', () => {
      setClasses([createClass(), createClass({ subjectId: 0 })]);

      expect(check('Svi časovi imaju izabrani predmet.').isValid).toBe(false);
      expect(check('Polja svih časova su ispravna').isValid).toBe(false);
      expect(text()).toContain('Svi časovi moraju imati izabrani predmet.');
    });

    it('should report a reservation without classes', () => {
      setClasses([]);

      expect(check('Rezervacija ima bar jedan čas').isValid).toBe(false);
    });
  });

  describe('actions', () => {
    it('should disable saving while the form is invalid', () => {
      expect(button('Sačuvaj').disabled).toBe(true);
    });

    it('should enable saving and emit submitClicked when the form is valid', () => {
      const emitted = vi.fn();
      component.submitClicked.subscribe(emitted);
      formService.reservationForm.studentId().value.set('student-1');
      setClasses([createClass()]);

      button('Sačuvaj').click();

      expect(button('Sačuvaj').disabled).toBe(false);
      expect(emitted).toHaveBeenCalledTimes(1);
    });

    it('should reset the form', () => {
      formService.reservationForm.studentId().value.set('student-1');
      formService.reservationForm.description().value.set('Opis');
      setClasses([createClass(), createClass()]);

      button('Poništi formu').click();

      expect(formService.reservationModel().studentId).toBe('');
      expect(formService.reservationModel().description).toBe('');
      expect(formService.reservationModel().classes).toHaveLength(1);
    });
  });
});
