import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton, provideHttpTesting, settle, typeInto } from '@core/testing/test-utils';
import { dateTimeInputValue } from '@core/utilities/date-helpers';
import { ClassFormService } from '@features/classes/services/class-form-service';
import {
  createClassReservationDetails,
  createFormClass,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  inDays,
  provideReservationFormTesting,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationListForm } from './class-reservation-list-form';

describe('ClassReservationListForm', () => {
  let fixture: ComponentFixture<ClassReservationListForm>;
  let element: HTMLElement;
  let form: ClassFormService;
  let http: HttpTestingController;

  const classes = () => form.reservationModel().classes;
  const removeButtons = () =>
    Array.from(
      element.querySelectorAll<HTMLButtonElement>('app-button[aria-label="Ukloni čas"] button'),
    );
  const subjectSelect = (index: number) =>
    element.querySelector<HTMLSelectElement>(`#class-subject-${index}`)!;
  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const errors = () =>
    Array.from(element.querySelectorAll('p.text-red-400')).map((error) =>
      error.textContent?.trim(),
    );
  const touch = async (id: string) => {
    input(id).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const setup = async (reservationId: string | null) => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationListForm],
      providers: [provideReservationFormTesting(reservationId), provideHttpTesting()],
    }).compileComponents();

    form = TestBed.inject(ClassFormService);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ClassReservationListForm);
    element = fixture.nativeElement;
    await flushLookups();
    await fixture.whenStable();
  };

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(() => setup(null));

    it('starts with one class that cannot be removed', () => {
      expect(classes().length).toBe(1);
      expect(removeButtons()[0].disabled).toBe(true);
      expect(element.textContent).toContain('Novi čas');
    });

    it('a new class starts right when the previous one ends', async () => {
      form.updateClass(0, {
        startsAt: dateTimeInputValue(inDays(3, 10)),
        endsAt: dateTimeInputValue(inDays(3, 10, 45)),
      });

      getButton(element, 'Dodaj čas')!.click();
      await fixture.whenStable();

      expect(classes().length).toBe(2);
      expect(classes()[1].startsAt).toBe(dateTimeInputValue(inDays(3, 10, 45)));
      expect(classes()[1].endsAt).toBe(dateTimeInputValue(inDays(3, 11, 30)));
      expect(removeButtons().every((button) => !button.disabled)).toBe(true);
    });

    it('removing a class that was never saved does not mark anything for deletion', async () => {
      getButton(element, 'Dodaj čas')!.click();
      await fixture.whenStable();

      removeButtons()[1].click();
      await fixture.whenStable();

      expect(classes().length).toBe(1);
      expect(form.reservationModel().classesToDelete).toEqual([]);
    });

    it('picking a subject stores its id and shows its name in the header', async () => {
      subjectSelect(0).value = '2';
      subjectSelect(0).dispatchEvent(new Event('change'));
      await fixture.whenStable();

      expect(classes()[0].subjectId).toBe(2);
      expect(element.querySelector('p.text-lg')?.textContent).toContain('Web programiranje');
    });

    it('shows the subject error only after the select was left', async () => {
      expect(errors()).not.toContain('Izaberi predmet časa.');

      subjectSelect(0).dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(errors()).toContain('Izaberi predmet časa.');
    });

    it('rejects a class that is free or has no price', async () => {
      typeInto(input('class-price-0'), '0');
      await touch('class-price-0');
      expect(errors()).toContain('Cena časa mora biti veća od 0 RSD.');

      typeInto(input('class-price-0'), '');
      await touch('class-price-0');
      expect(errors()).toContain('Unesi cenu časa.');
    });

    it('rejects a class longer than 45 minutes', async () => {
      form.updateClass(0, {
        startsAt: dateTimeInputValue(inDays(3, 10)),
        endsAt: dateTimeInputValue(inDays(3, 10, 46)),
      });
      await touch('class-end-0');

      expect(errors()).toContain('Čas ne može trajati duže od 45 minuta');
    });

    it('rejects a class that ends before it starts', async () => {
      form.updateClass(0, {
        startsAt: dateTimeInputValue(inDays(3, 10)),
        endsAt: dateTimeInputValue(inDays(3, 10)),
      });
      await touch('class-end-0');

      expect(errors()).toContain('Kraj časa mora biti posle početka');
    });
  });

  describe('the schedule between classes', () => {
    beforeEach(async () => {
      await setup(null);
    });

    const schedule = async (secondStart: Date) => {
      form.reservationModel.set(
        createValidReservationModel({
          classes: [createFormClass(inDays(3, 10)), createFormClass(secondStart)],
        }),
      );
      await fixture.whenStable();
      await touch('class-start-1');
    };

    it('accepts a class that starts right after the previous one', async () => {
      await schedule(inDays(3, 10, 45));
      expect(errors()).toEqual([]);
    });

    it('accepts a break of exactly 60 minutes', async () => {
      await schedule(inDays(3, 11, 45));
      expect(errors()).toEqual([]);
    });

    it('rejects a break longer than 60 minutes', async () => {
      await schedule(inDays(3, 11, 46));
      expect(errors()).toContain('Pauza posle prethodnog časa ne može biti duža od 60 minuta');
    });

    it('rejects a class that overlaps the previous one', async () => {
      await schedule(inDays(3, 10, 30));
      expect(errors()).toContain('Čas se preklapa sa prethodnim časom');
    });

    it('rejects classes that are not in chronological order', async () => {
      await schedule(inDays(3, 9));
      expect(errors()).toContain('Časovi moraju biti poređani hronološki');
    });
  });

  describe('on the details page', () => {
    beforeEach(async () => {
      await setup('7');
      expectReservationDetailsRequest().flush(createClassReservationDetails());
      await settle();
      await fixture.whenStable();
    });

    it('shows the saved classes with their subjects selected', () => {
      expect(classes().map((classItem) => classItem.id)).toEqual([21, 22]);
      expect(subjectSelect(0).value).toBe('1');
      expect(subjectSelect(1).value).toBe('2');
    });

    it('removing a saved class marks it for deletion', async () => {
      removeButtons()[0].click();
      await fixture.whenStable();

      expect(classes().map((classItem) => classItem.id)).toEqual([22]);
      expect(form.reservationModel().classesToDelete).toEqual([21]);
    });

    it('the last remaining class cannot be removed', async () => {
      removeButtons()[0].click();
      await fixture.whenStable();

      expect(removeButtons()[0].disabled).toBe(true);
    });
  });
});
