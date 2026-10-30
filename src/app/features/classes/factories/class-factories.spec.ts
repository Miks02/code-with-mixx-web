import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dateInputValue } from '@core/utilities/date-helpers';
import { ReservationStatus } from '@features/reservations';
import { ClassReservationDetails } from '../models/class-reservation-details';
import {
  ClassItemFormModel,
  ClassReservationFormModel,
} from '../models/create-class-reservation-request';
import {
  createClassReservationForm,
  createClassReservationFormModel,
  createClassReservationRequest,
  createEmptyClass,
  createEmptyClassReservation,
  createUpdateClassReservationRequest,
} from './class-factories';

describe('class factories', () => {
  function createClass(changes: Partial<ClassItemFormModel> = {}): ClassItemFormModel {
    return {
      id: 0,
      subjectId: 1,
      price: 1300,
      startsAt: '2026-11-03T10:00',
      endsAt: '2026-11-03T10:45',
      reservedAt: '2026-10-20',
      ...changes,
    };
  }

  function createModel(
    changes: Partial<ClassReservationFormModel> = {},
  ): ClassReservationFormModel {
    return {
      ...createEmptyClassReservation(),
      studentId: 'student-1',
      reservedAt: '2026-10-20',
      classes: [createClass()],
      ...changes,
    };
  }

  function setup(model: ClassReservationFormModel) {
    const request = signal(model);
    const form = runInInjectionContext(TestBed.inject(Injector), () =>
      createClassReservationForm(request),
    );
    return { request, form };
  }

  function classErrors(form: ReturnType<typeof setup>['form'], index: number) {
    const field = form.classes[index];
    return [
      ...field.subjectId().errors(),
      ...field.price().errors(),
      ...field.startsAt().errors(),
      ...field.endsAt().errors(),
      ...field.reservedAt().errors(),
    ].map((e) => e.message);
  }

  describe('createEmptyClass', () => {
    it('should create a new 45 minute class starting at the given time', () => {
      const classItem = createEmptyClass(new Date(2026, 10, 3, 10, 0));

      expect(classItem).toEqual({
        id: 0,
        subjectId: 0,
        price: 1300,
        startsAt: '2026-11-03T10:00',
        endsAt: '2026-11-03T10:45',
        reservedAt: dateInputValue(),
      });
    });
  });

  describe('createClassReservationFormModel', () => {
    it('should map details to the form model with datetime-local values', () => {
      const details = {
        studentId: 'student-1',
        totalPrice: 2600,
        reservationStatus: ReservationStatus.Confirmed,
        reservedAt: '2026-10-18',
        description: null,
        classes: [
          {
            id: 4,
            subjectId: 2,
            subjectName: 'Algoritmi',
            price: 1300,
            startsAt: '2026-11-03T10:00:00',
            endsAt: '2026-11-03T10:45:00',
            reservedAt: '2026-10-20',
          },
        ],
      } as ClassReservationDetails;

      const model = createClassReservationFormModel(details);

      expect(model).toMatchObject({
        studentId: 'student-1',
        totalPrice: 2600,
        reservedAt: '2026-10-18',
        description: '',
        classesToDelete: [],
      });
      expect(model.classes[0]).toEqual({
        id: 4,
        subjectId: 2,
        price: 1300,
        startsAt: '2026-11-03T10:00',
        endsAt: '2026-11-03T10:45',
        reservedAt: '2026-10-20',
      });
    });
  });

  describe('createClassReservationFormModel without a reservation date', () => {
    it('should keep the reservation date field in the form', () => {
      const details = {
        studentId: 'student-1',
        totalPrice: 1300,
        reservationStatus: ReservationStatus.Confirmed,
        description: null,
        classes: [],
      } as unknown as ClassReservationDetails;
      const { form } = setup(createModel());

      form().value.set(createClassReservationFormModel(details));

      expect(form.reservedAt).toBeDefined();
      expect(form.reservedAt().errors()[0]?.message).toBe('Unesi datum rezervisanja');
    });
  });

  describe('requests', () => {
    const model = createModel({
      description: '',
      classesToDelete: [9],
      classes: [
        createClass({ id: 3 }),
        createClass({ startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' }),
      ],
    });

    it('should build a create request without class ids and with ISO times', () => {
      const request = createClassReservationRequest(model);

      expect(request.description).toBeNull();
      expect(request.classes[0]).toEqual({
        subjectId: 1,
        price: 1300,
        startsAt: new Date('2026-11-03T10:00').toISOString(),
        endsAt: new Date('2026-11-03T10:45').toISOString(),
        reservedAt: '2026-10-20',
      });
    });

    it('should build an update request with class ids and deleted classes', () => {
      const request = createUpdateClassReservationRequest(5, model);

      expect(request.id).toBe(5);
      expect(request.totalPrice).toBeNull();
      expect(request.classesToDelete).toEqual([9]);
      expect(request.classes.map((c) => c.id)).toEqual([3, 0]);
    });
  });

  describe('createClassReservationForm', () => {
    it('should be valid for a correct reservation', () => {
      const { form } = setup(
        createModel({
          classes: [
            createClass(),
            createClass({ startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' }),
          ],
        }),
      );

      expect(form().valid()).toBe(true);
      expect(classErrors(form, 0)).toEqual([]);
      expect(classErrors(form, 1)).toEqual([]);
    });

    it('should resolve errors of every class field without throwing', () => {
      const { form } = setup(
        createModel({
          classes: [createClass(), createClass({ subjectId: 0, reservedAt: '2026-10-01' })],
        }),
      );

      expect(() => classErrors(form, 1)).not.toThrow();
      expect(classErrors(form, 1)).toEqual([
        'Izaberi predmet časa.',
        'Čas se preklapa sa prethodnim časom',
        'Datum rezervisanja časa ne može biti pre datuma rezervacije',
      ]);
    });

    describe('reservation', () => {
      it('should require a student', () => {
        const { form } = setup(createModel({ studentId: '' }));

        expect(form.studentId().errors()[0]?.message).toBe('Izaberi studenta.');
      });

      it('should not allow a reservation date after the first class', () => {
        const pastClass = createClass({
          startsAt: '2026-10-22T10:00',
          endsAt: '2026-10-22T10:45',
          reservedAt: '2026-10-20',
        });
        const { form } = setup(createModel({ reservedAt: '2026-10-23', classes: [pastClass] }));

        expect(
          form
            .reservedAt()
            .errors()
            .map((e) => e.message),
        ).toContain('Datum rezervisanja ne može biti posle prvog časa');
      });

      it('should require at least one class', () => {
        const { form } = setup(createModel({ classes: [] }));

        expect(form.classes().errors()[0]?.message).toBe('Rezervacija mora imati barem 1 čas');
      });
    });

    describe('class', () => {
      it.each([
        [{ price: 0 }, 'Cena časa mora biti veća od 0 RSD.'],
        [{ endsAt: '2026-11-03T09:00' }, 'Kraj časa mora biti posle početka'],
        [{ endsAt: '2026-11-03T11:00' }, 'Čas ne može trajati duže od 45 minuta'],
        [
          { startsAt: '2026-10-22T10:00', endsAt: '2026-10-22T10:45', reservedAt: '2026-10-23' },
          'Datum rezervisanja mora biti pre početka časa',
        ],
      ])('should reject %o', (changes, message) => {
        const { form } = setup(createModel({ classes: [createClass(changes)] }));

        expect(classErrors(form, 0)).toContain(message);
      });
    });

    describe('class order', () => {
      it('should require chronological order', () => {
        const { form } = setup(
          createModel({
            classes: [
              createClass({ startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' }),
              createClass(),
            ],
          }),
        );

        expect(classErrors(form, 1)).toEqual(['Časovi moraju biti poređani hronološki']);
      });

      it('should reject a break longer than 60 minutes', () => {
        const { form } = setup(
          createModel({
            classes: [
              createClass(),
              createClass({ startsAt: '2026-11-03T12:00', endsAt: '2026-11-03T12:45' }),
            ],
          }),
        );

        expect(classErrors(form, 1)).toEqual([
          'Pauza posle prethodnog časa ne može biti duža od 60 minuta',
        ]);
      });

      it('should revalidate when the previous class changes', () => {
        const { request, form } = setup(
          createModel({
            classes: [
              createClass(),
              createClass({ startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' }),
            ],
          }),
        );

        request.update((m) => ({
          ...m,
          classes: [{ ...m.classes[0], endsAt: '2026-11-03T11:00' }, m.classes[1]],
        }));

        expect(classErrors(form, 1)).toEqual(['Čas se preklapa sa prethodnim časom']);
      });
    });
  });
});
