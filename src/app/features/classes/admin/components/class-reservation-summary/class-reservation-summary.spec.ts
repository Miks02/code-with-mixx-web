import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { dateInputValue } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { ClassFormService } from '@features/classes/services/class-form-service';
import {
  CLASS_RESERVATIONS_URL,
  createClassReservationDetails,
  createFormClass,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  flushReservationDetailsRefetch,
  inDays,
  provideReservationFormTesting,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationSummary } from './class-reservation-summary';

describe('ClassReservationSummary', () => {
  let fixture: ComponentFixture<ClassReservationSummary>;
  let element: HTMLElement;
  let form: ClassFormService;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  const stats = () =>
    Object.fromEntries(
      Array.from(element.querySelectorAll('.grid > div')).map((stat) => [
        stat.querySelector('p.text-sm')?.textContent?.trim(),
        stat.querySelector('p.text-lg')?.textContent?.trim(),
      ]),
    );
  const paymentBadge = () => element.querySelector('span.rounded-full')?.textContent?.trim();
  const checks = () =>
    Array.from(element.querySelectorAll('li')).map((check) => check.textContent?.trim());
  const saveButton = () => getButton(element, 'Sačuvaj')!;
  const save = async () => {
    saveButton().click();
    await settle();
  };

  const setup = async (reservationId: string | null) => {
    toast = createToastServiceMock();
    await TestBed.configureTestingModule({
      imports: [ClassReservationSummary],
      providers: [
        provideReservationFormTesting(reservationId),
        provideHttpTesting({ toastService: toast }),
      ],
    }).compileComponents();

    form = TestBed.inject(ClassFormService);
    http = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(ClassReservationSummary);
    element = fixture.nativeElement;
    await flushLookups();
  };

  const loadDetails = async (overrides = {}) => {
    expectReservationDetailsRequest().flush(createClassReservationDetails(overrides));
    await settle();
    await fixture.whenStable();
  };

  afterEach(() => {
    flushReservationDetailsRefetch();
    http.verify();
  });

  describe('prices on the create page', () => {
    beforeEach(() => setup(null));

    const fill = async (totalPrice: number | null, prices: number[]) => {
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice,
          classes: prices.map((price, index) => createFormClass(inDays(3, 10 + index), { price })),
        }),
      );
      await fixture.whenStable();
    };

    it('without a manual price the total is the sum of the classes', async () => {
      await fill(null, [1300, 1500]);

      expect(stats()).toEqual({
        'Ukupna cena': priceConverter(2800),
        Preostalo: priceConverter(2800),
      });
    });

    it('shows the discount as the share of the classes sum that was taken off', async () => {
      await fill(1950, [1300, 1300]);
      expect(stats()['Popust']).toBe('25%');
    });

    it('rounds the discount to two decimals', async () => {
      await fill(2000, [3000]);
      expect(stats()['Popust']).toBe('33.33%');
    });

    it('shows no discount when the total is higher than the classes sum', async () => {
      await fill(5000, [1300]);
      expect(stats()['Popust']).toBeUndefined();
    });

    it('shows a free reservation instead of a price of zero', async () => {
      await fill(0, [1300]);

      expect(stats()['Ukupna cena']).toBe('Besplatno');
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Čeka uplatu');
    });

    it('names each class by its subject and falls back to "Novi čas"', async () => {
      form.reservationModel.set(
        createValidReservationModel({
          classes: [
            createFormClass(inDays(3, 10), { subjectId: 2 }),
            createFormClass(inDays(3, 11), { subjectId: 0 }),
          ],
        }),
      );
      await fixture.whenStable();

      expect(element.textContent).toContain('Časovi (2)');
      expect(element.textContent).toContain('Web programiranje');
      expect(element.textContent).toContain('Novi čas');
    });
  });

  describe('payments on the details page', () => {
    beforeEach(() => setup('7'));

    it('a partly paid reservation shows what was paid and what remains', async () => {
      await loadDetails({ totalPrice: 2600, paidAmount: 1300 });

      expect(stats()['Plaćeno']).toBe(priceConverter(1300));
      expect(stats()['Preostalo']).toBe(priceConverter(1300));
      expect(paymentBadge()).toBe('Delimično plaćeno');
    });

    it('paying more than the price shows the extra as a bonus and nothing remaining', async () => {
      await loadDetails({ totalPrice: 2600, paidAmount: 3000 });

      expect(stats()['Bonus']).toBe(priceConverter(400));
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Plaćeno');
    });

    it('lowering the price below what was paid turns the difference into a bonus', async () => {
      await loadDetails({ totalPrice: 2600, paidAmount: 2600 });

      form.reservationForm.totalPrice().value.set(2000);
      await fixture.whenStable();

      expect(stats()['Bonus']).toBe(priceConverter(600));
    });
  });

  describe('checks', () => {
    beforeEach(() => setup(null));

    it('a fresh form is missing the student and the subject, so it cannot be saved', async () => {
      await fixture.whenStable();

      expect(checks()).toContain('Student nije izabran');
      expect(checks()).toContain('Svi časovi moraju imati izabrani predmet.');
      expect(saveButton().disabled).toBe(true);
    });

    it('a complete form passes every check and can be saved', async () => {
      form.reservationModel.set(createValidReservationModel());
      await fixture.whenStable();

      expect(checks()).toEqual([
        'Student je izabran',
        'Rezervacija ima bar jedan čas',
        'Polja svih časova su ispravna',
        'Svi časovi imaju izabrani predmet.',
      ]);
      expect(saveButton().disabled).toBe(false);
    });

    it('a reservation date after the first class cannot be saved', async () => {
      form.reservationModel.set(
        createValidReservationModel({
          reservedAt: dateInputValue(),
          classes: [createFormClass(inDays(-2), { reservedAt: dateInputValue(-3) })],
        }),
      );
      await fixture.whenStable();

      expect(saveButton().disabled).toBe(true);
    });

    it('a reservation date in the future cannot be saved', async () => {
      form.reservationModel.set(createValidReservationModel({ reservedAt: dateInputValue(1) }));
      await fixture.whenStable();

      expect(saveButton().disabled).toBe(true);
    });

    it('a description longer than 500 characters cannot be saved', async () => {
      form.reservationModel.set(createValidReservationModel({ description: 'a'.repeat(501) }));
      await fixture.whenStable();

      expect(saveButton().disabled).toBe(true);
    });
  });

  describe('saving on the create page', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(createValidReservationModel({ description: '' }));
      await fixture.whenStable();
    });

    it('creates the reservation, sends UTC times and an empty description as null', async () => {
      const model = form.reservationModel();
      await save();

      const request = http.expectOne(
        (req) => req.url === CLASS_RESERVATIONS_URL && req.method === 'POST',
      );
      expect(request.request.body).toEqual(
        expect.objectContaining({
          studentId: 'student-1',
          totalPrice: null,
          description: null,
        }),
      );
      expect(request.request.body.classes[0]).toEqual({
        subjectId: 1,
        price: 1300,
        startsAt: new Date(model.classes[0].startsAt).toISOString(),
        endsAt: new Date(model.classes[0].endsAt).toISOString(),
        reservedAt: model.classes[0].reservedAt,
      });
      request.flush(null);
      await settle();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno kreirana.');
      expect(navigateByUrl).toHaveBeenCalledWith('/admin/classes');
    });

    it('cannot be saved twice while the request is running', async () => {
      await save();
      fixture.detectChanges();

      expect(saveButton().disabled).toBe(true);

      http.expectOne((req) => req.method === 'POST').flush(null);
      await settle();
    });

    it.each([
      ['Student.NotFound', 'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.'],
      ['Reservation.ClassesOverlap', 'Časovi se ne smeju preklapati.'],
    ])('stays on the page and shows %s', async (errorCode, message) => {
      await save();

      http
        .expectOne((req) => req.method === 'POST')
        .flush(createProblemDetails(errorCode), { status: 409, statusText: 'Conflict' });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(message);
      expect(navigateByUrl).not.toHaveBeenCalled();
    });

    it('points to the form when the backend rejects the fields', async () => {
      await save();

      http
        .expectOne((req) => req.method === 'POST')
        .flush(
          createProblemDetails('General.Validation', {
            status: 400,
            errors: { StudentId: ['Student is required.'] },
          }),
          { status: 400, statusText: 'Bad Request' },
        );
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Podaci rezervacije nisu ispravni. Proveri polja forme.',
      );
    });
  });

  describe('saving on the details page', () => {
    beforeEach(async () => {
      await setup('7');
      await loadDetails();
    });

    it('updates the loaded reservation and goes back to the list', async () => {
      await save();

      const request = http.expectOne(
        (req) => req.url === `${CLASS_RESERVATIONS_URL}/7` && req.method === 'PUT',
      );
      expect(request.request.body).toEqual(
        expect.objectContaining({
          id: 7,
          studentId: 'student-2',
          totalPrice: 2600,
          classesToDelete: [],
        }),
      );
      expect(request.request.body.classes.map((classItem: { id: number }) => classItem.id)).toEqual(
        [21, 22],
      );
      expect(request.request.body.reservedAt).toBeUndefined();
      request.flush(null);
      await settle();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno ažurirana.');
      expect(navigateByUrl).toHaveBeenCalledWith('/admin/classes');
    });

    it('a class added after a past class is reserved no later than it starts', async () => {
      form.addClass();
      await fixture.whenStable();

      const added = form.reservationModel().classes[2];
      expect(added.reservedAt).toBe(added.startsAt.slice(0, 10));
      expect(form.reservationForm.classes[2].reservedAt().errors()).toEqual([]);
    });

    it('sends the removed classes and an id of 0 for the new ones', async () => {
      form.removeClass(1);
      form.addClass();
      form.updateClass(1, { subjectId: 2 });
      await fixture.whenStable();

      await save();

      const request = http.expectOne((req) => req.method === 'PUT');
      expect(request.request.body.classesToDelete).toEqual([22]);
      expect(request.request.body.classes.map((classItem: { id: number }) => classItem.id)).toEqual(
        [21, 0],
      );
      request.flush(null);
      await settle();
    });

    it('explains that an archived reservation cannot be changed', async () => {
      await save();

      http
        .expectOne((req) => req.method === 'PUT')
        .flush(createProblemDetails('Reservation.CantUpdateAnArchivedReservation'), {
          status: 409,
          statusText: 'Conflict',
        });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith('Nije moguće izmeniti arhiviranu rezervaciju.');
      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  it('"Poništi formu" clears what was entered', async () => {
    await setup(null);
    form.reservationModel.set(createValidReservationModel({ totalPrice: 1000 }));
    await fixture.whenStable();

    getButton(element, 'Poništi formu')!.click();
    await fixture.whenStable();

    expect(form.reservationModel().studentId).toBe('');
    expect(form.reservationModel().totalPrice).toBeNull();
    expect(form.reservationModel().classes.map((classItem) => classItem.subjectId)).toEqual([0]);
  });
});
