import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  createProblemDetails,
  createToastServiceMock,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { dateInputValue } from '@core/utilities/date-helpers';
import { AdminClassReservationStore } from '@features/classes/admin/stores/admin-class-reservation-store';
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
import { createEmptyClass } from '../factories/class-factories';
import { ClassFormService } from './class-form-service';

describe('ClassFormService', () => {
  let service: ClassFormService;

  function classes() {
    return service.reservationModel().classes;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpTesting()] });
    service = TestBed.inject(ClassFormService);
    service.reservationModel.update((model) => ({
      ...model,
      classes: [
        { ...createEmptyClass(), id: 1, startsAt: '2026-11-03T10:00', endsAt: '2026-11-03T10:45' },
        { ...createEmptyClass(), id: 2, startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' },
      ],
    }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addClass', () => {
    it('should add a new class starting when the last one ends', () => {
      service.addClass();

      expect(classes()).toHaveLength(3);
      expect(classes()[2]).toMatchObject({
        id: 0,
        startsAt: '2026-11-03T11:35',
        endsAt: '2026-11-03T12:20',
      });
    });
  });

  describe('removeClass', () => {
    it('should mark an existing class for deletion', () => {
      service.removeClass(0);

      expect(classes().map((c) => c.id)).toEqual([2]);
      expect(service.reservationModel().classesToDelete).toEqual([1]);
    });

    it('should not mark a new class for deletion', () => {
      service.addClass();

      service.removeClass(2);

      expect(classes()).toHaveLength(2);
      expect(service.reservationModel().classesToDelete).toEqual([]);
    });

    it('should not remove the only class', () => {
      service.removeClass(0);
      service.removeClass(0);

      expect(classes().map((c) => c.id)).toEqual([2]);
      expect(service.reservationModel().classesToDelete).toEqual([1]);
    });

    it('should ignore an unknown class index', () => {
      const before = service.reservationModel();

      service.removeClass(5);

      expect(service.reservationModel()).toBe(before);
    });
  });

  describe('updateClass', () => {
    it('should update only the selected class', () => {
      service.updateClass(1, { price: 2000 });

      expect(classes().map((c) => c.price)).toEqual([1300, 2000]);
    });
  });

  describe('reset', () => {
    it('should restore an empty reservation', () => {
      service.removeClass(0);

      service.reset();

      expect(classes()).toHaveLength(1);
      expect(classes()[0].id).toBe(0);
      expect(service.reservationModel().classesToDelete).toEqual([]);
    });
  });
});

describe('ClassFormService on the reservation pages', () => {
  let form: ClassFormService;
  let store: InstanceType<typeof AdminClassReservationStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  const checkLabels = () =>
    form.checks().map((check) => (check.isValid ? check.validLabel : check.invalidLabel));

  const setup = async (reservationId: string | null) => {
    toast = createToastServiceMock();
    TestBed.configureTestingModule({
      providers: [
        provideReservationFormTesting(reservationId),
        provideHttpTesting({ toastService: toast }),
      ],
    });

    form = TestBed.inject(ClassFormService);
    store = TestBed.inject(AdminClassReservationStore);
    http = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await flushLookups();
  };

  const loadDetails = async (overrides = {}) => {
    expectReservationDetailsRequest().flush(createClassReservationDetails(overrides));
    await settle();
  };

  afterEach(() => {
    flushReservationDetailsRefetch();
    http.verify();
  });

  describe('totals', () => {
    beforeEach(() => setup(null));

    const fill = (totalPrice: number | null, prices: number[]) =>
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice,
          classes: prices.map((price, index) => createFormClass(inDays(3, 10 + index), { price })),
        }),
      );

    it('without a manual price the total is the sum of the classes', () => {
      fill(null, [1300, 1500]);

      expect(form.itemsTotal()).toBe(2800);
      expect(form.totalPrice()).toBe(2800);
    });

    it('a manual price replaces the sum of the classes', () => {
      fill(1950, [1300, 1300]);

      expect(form.itemsTotal()).toBe(2600);
      expect(form.totalPrice()).toBe(1950);
    });
  });

  describe('"Zbir časova"', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice: null,
          classes: [
            createFormClass(inDays(3, 10), { price: 1300 }),
            createFormClass(inDays(3, 11), { price: 1500 }),
          ],
        }),
      );
    });

    it('starts on and leaves the price to the backend', () => {
      expect(form.useItemsSum()).toBe(true);
      expect(form.itemsTotal()).toBe(2800);
      expect(form.reservationModel().totalPrice).toBeNull();
    });

    it('turning the sum off prefills the price with the sum and stops following the classes', () => {
      form.setUseItemsSum(false);
      expect(form.reservationModel().totalPrice).toBe(2800);

      form.updateClass(0, { price: 9000 });
      expect(form.reservationModel().totalPrice).toBe(2800);
    });

    it('turning the sum back on drops the manual price', () => {
      form.setUseItemsSum(false);
      form.reservationForm.totalPrice().value.set(2000);

      form.setUseItemsSum(true);

      expect(form.useItemsSum()).toBe(true);
      expect(form.reservationModel().totalPrice).toBeNull();
    });

    it('clearing the manual price keeps it manual instead of switching to the sum', () => {
      form.setUseItemsSum(false);

      form.reservationForm.totalPrice().value.set(null);

      expect(form.useItemsSum()).toBe(false);
    });

    it('rejects a negative manual price', () => {
      form.setUseItemsSum(false);
      form.reservationForm.totalPrice().value.set(-100);

      expect(form.reservationForm.totalPrice().errors()[0]?.message).toBe(
        'Ukupna cena rezervacije može biti najmanje 0 RSD.',
      );
    });

    it('allows a free reservation', () => {
      form.setUseItemsSum(false);
      form.reservationForm.totalPrice().value.set(0);

      expect(form.reservationForm.totalPrice().errors()).toEqual([]);
    });
  });

  it('a saved reservation has its own price, so "Zbir časova" starts off', async () => {
    await setup('7');
    await loadDetails({ totalPrice: 2000 });

    expect(form.useItemsSum()).toBe(false);
    expect(form.reservationModel().totalPrice).toBe(2000);
  });

  describe('checks', () => {
    beforeEach(() => setup(null));

    it('a fresh form is missing the student and the subject, so it cannot be saved', () => {
      expect(checkLabels()).toContain('Student nije izabran');
      expect(checkLabels()).toContain('Svi časovi moraju imati izabrani predmet.');
      expect(form.reservationForm().valid()).toBe(false);
    });

    it('a complete form passes every check and can be saved', () => {
      form.reservationModel.set(createValidReservationModel());

      expect(checkLabels()).toEqual([
        'Student je izabran',
        'Rezervacija ima bar jedan čas',
        'Polja svih časova su ispravna',
        'Svi časovi imaju izabrani predmet.',
      ]);
      expect(form.reservationForm().valid()).toBe(true);
    });

    it('a reservation date after the first class cannot be saved', () => {
      form.reservationModel.set(
        createValidReservationModel({
          reservedAt: dateInputValue(),
          classes: [createFormClass(inDays(-2), { reservedAt: dateInputValue(-3) })],
        }),
      );

      expect(form.reservationForm().valid()).toBe(false);
    });

    it('a reservation date in the future cannot be saved', () => {
      form.reservationModel.set(createValidReservationModel({ reservedAt: dateInputValue(1) }));

      expect(form.reservationForm().valid()).toBe(false);
    });

    it('a description longer than 500 characters cannot be saved', () => {
      form.reservationModel.set(createValidReservationModel({ description: 'a'.repeat(501) }));

      expect(form.reservationForm().valid()).toBe(false);
    });
  });

  describe('saving a new reservation', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(createValidReservationModel({ description: '' }));
    });

    it('creates the reservation, sends UTC times and an empty description as null', async () => {
      const model = form.reservationModel();
      form.save(null);
      await settle();

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
        name: 'Normalizacija',
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

    it('marks the store as saving while the request is running', async () => {
      form.save(null);
      await settle();

      expect(store.isSaving()).toBe(true);

      http.expectOne((req) => req.method === 'POST').flush(null);
      await settle();
      expect(store.isSaving()).toBe(false);
    });

    it.each([
      ['Student.NotFound', 'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.'],
      ['Reservation.ClassesOverlap', 'Časovi se ne smeju preklapati.'],
    ])('stays on the page and shows %s', async (errorCode, message) => {
      form.save(null);
      await settle();

      http
        .expectOne((req) => req.method === 'POST')
        .flush(createProblemDetails(errorCode), { status: 409, statusText: 'Conflict' });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(message);
      expect(navigateByUrl).not.toHaveBeenCalled();
    });

    it('points to the form when the backend rejects the fields', async () => {
      form.save(null);
      await settle();

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

  describe('saving a loaded reservation', () => {
    beforeEach(async () => {
      await setup('7');
      await loadDetails();
    });

    it('updates the loaded reservation and goes back to the list', async () => {
      form.save(7);
      await settle();

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

    it('a class added after a past class is reserved no later than it starts', () => {
      form.addClass();

      const added = form.reservationModel().classes[2];
      expect(added.reservedAt).toBe(added.startsAt.slice(0, 10));
      expect(form.reservationForm.classes[2].reservedAt().errors()).toEqual([]);
    });

    it('sends the removed classes and an id of 0 for the new ones', async () => {
      form.removeClass(1);
      form.addClass();
      form.updateClass(1, { subjectId: 2, name: 'Rekurzija' });

      form.save(7);
      await settle();

      const request = http.expectOne((req) => req.method === 'PUT');
      expect(request.request.body.classesToDelete).toEqual([22]);
      expect(request.request.body.classes.map((classItem: { id: number }) => classItem.id)).toEqual(
        [21, 0],
      );
      request.flush(null);
      await settle();
    });

    it('explains that an archived reservation cannot be changed', async () => {
      form.save(7);
      await settle();

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
});
