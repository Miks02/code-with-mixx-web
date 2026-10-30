import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectLookupItem } from '@features/subjects';
import { createEmptyClass } from '@features/classes/factories/class-factories';
import { ClassItemFormModel } from '@features/classes/models/create-class-reservation-request';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationListForm } from './class-reservation-list-form';

describe('ClassReservationListForm', () => {
  let component: ClassReservationListForm;
  let fixture: ComponentFixture<ClassReservationListForm>;
  let formService: ClassFormService;

  const subjectsLookup: SubjectLookupItem[] = [
    { id: 1, subjectName: 'Algoritmi' },
    { id: 2, subjectName: 'Baze podataka' },
  ];

  function createClass(changes: Partial<ClassItemFormModel> = {}): ClassItemFormModel {
    return {
      ...createEmptyClass(),
      subjectId: 1,
      price: 1300,
      startsAt: '2026-11-03T10:00',
      endsAt: '2026-11-03T10:45',
      reservedAt: '2026-10-20',
      ...changes,
    };
  }

  function setClasses(classes: ClassItemFormModel[]) {
    formService.reservationModel.update((model) => ({
      ...model,
      reservedAt: '2026-10-20',
      classes,
    }));
    fixture.detectChanges();
  }

  function classes() {
    return formService.reservationModel().classes;
  }

  function query<T extends Element>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  function removeButtons(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('app-button[aria-label="Ukloni čas"] button'),
    );
  }

  function addButton(): HTMLButtonElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Dodaj čas'))!;
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  beforeEach(async () => {
    // jsdom doesn't implement scrolling
    Element.prototype.scrollTo = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ClassReservationListForm],
      providers: [ClassFormService],
    }).compileComponents();

    formService = TestBed.inject(ClassFormService);
    fixture = TestBed.createComponent(ClassReservationListForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subjectsLookup', subjectsLookup);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should render one empty class from the default reservation', () => {
      expect(classes()).toHaveLength(1);
      expect(query('#class-subject-0')).not.toBeNull();
      expect(query('#class-subject-1')).toBeNull();
      expect(text()).toContain('Novi čas');
    });

    it('should add a class when the model starts without classes', () => {
      formService.reservationModel.update((model) => ({ ...model, classes: [] }));

      TestBed.createComponent(ClassReservationListForm);

      expect(classes()).toHaveLength(1);
    });
  });

  describe('adding and removing classes', () => {
    it('should add a class that starts when the previous one ends', () => {
      setClasses([createClass()]);

      addButton().click();
      fixture.detectChanges();

      expect(classes()).toHaveLength(2);
      expect(classes()[1].startsAt).toBe('2026-11-03T10:45');
      expect(classes()[1].endsAt).toBe('2026-11-03T11:30');
      expect(query('#class-subject-1')).not.toBeNull();
    });

    it('should scroll to the newly added class', async () => {
      addButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(Element.prototype.scrollTo).toHaveBeenCalled();
    });

    it('should not allow removing the only class', () => {
      expect(removeButtons()[0].disabled).toBe(true);
    });

    it('should remove the selected class', () => {
      setClasses([
        createClass({ subjectId: 1 }),
        createClass({ subjectId: 2, startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' }),
      ]);

      removeButtons()[0].click();
      fixture.detectChanges();

      expect(classes()).toHaveLength(1);
      expect(classes()[0].subjectId).toBe(2);
    });
  });

  describe('subject', () => {
    it('should list subjects from the lookup', () => {
      const options = Array.from(query<HTMLSelectElement>('#class-subject-0').options).map((o) =>
        o.textContent?.trim(),
      );

      expect(options).toEqual(['Izaberi predmet', 'Algoritmi', 'Baze podataka']);
    });

    it('should update the class subject and show its name', () => {
      const select = query<HTMLSelectElement>('#class-subject-0');
      select.value = '2';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(classes()[0].subjectId).toBe(2);
      expect(text()).toContain('Baze podataka');
      expect(text()).not.toContain('Novi čas');
    });

    it('should ignore a subject that is not in the lookup', () => {
      component.onSubjectChanged(0, { target: { value: '99' } } as unknown as Event);

      expect(classes()[0].subjectId).toBe(0);
    });
  });

  describe('fields', () => {
    beforeEach(() => setClasses([createClass()]));

    it('should bind the class values to the inputs', () => {
      expect(query<HTMLInputElement>('#class-price-0').value).toBe('1300');
      expect(query<HTMLInputElement>('#class-start-0').value).toBe('2026-11-03T10:00');
      expect(query<HTMLInputElement>('#class-end-0').value).toBe('2026-11-03T10:45');
      expect(query<HTMLInputElement>('#class-reserved-0').value).toBe('2026-10-20');
    });

    it('should write input changes back to the model', () => {
      const end = query<HTMLInputElement>('#class-end-0');
      end.value = '2026-11-03T10:30';
      end.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(classes()[0].endsAt).toBe('2026-11-03T10:30');
    });

    it('should show the class date, time range and price in the header', () => {
      expect(text()).toContain(component.timeConverter('2026-11-03T10:00'));
      expect(text()).toContain(component.timeConverter('2026-11-03T10:45'));
      expect(text()).toContain(component.priceConverter(1300));
    });
  });

  describe('validation errors', () => {
    it('should show an error for a class that is too long once touched', () => {
      setClasses([createClass({ endsAt: '2026-11-03T11:00' })]);

      formService.reservationForm.classes[0].endsAt().markAsTouched();
      fixture.detectChanges();

      expect(text()).toContain('Čas ne može trajati duže od 45 minuta');
    });

    it('should show an error for overlapping classes', () => {
      setClasses([
        createClass(),
        createClass({ startsAt: '2026-11-03T10:30', endsAt: '2026-11-03T11:00' }),
      ]);

      formService.reservationForm.classes[1].startsAt().markAsTouched();
      fixture.detectChanges();

      expect(text()).toContain('Čas se preklapa sa prethodnim časom');
    });

    it('should show a subject error once the select is blurred', () => {
      query<HTMLSelectElement>('#class-subject-0').dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(text()).toContain('Izaberi predmet časa.');
    });

    it('should not render an empty error for a touched valid field', () => {
      setClasses([createClass()]);

      formService.reservationForm.classes[0].endsAt().markAsTouched();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('p.text-red-400')).toHaveLength(0);
    });

    it('should not show errors for untouched fields', () => {
      expect(text()).not.toContain('Izaberi predmet časa.');
    });
  });
});
