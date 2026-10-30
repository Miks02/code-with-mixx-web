import { WritableSignal } from '@angular/core';
import {
  applyEach,
  form,
  maxLength,
  min,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import {
  dateInputValue,
  dateTimeInputValue,
  isAfter,
  isBefore,
  isValidDate,
} from '@core/utilities/date-helpers';
import { ReservationStatus } from '@features/reservations';
import { ClassReservationDetails } from '../models/class-reservation-details';
import {
  ClassItemRequest,
  ClassReservationFormModel,
  CreateClassReservationRequest,
} from '../models/create-class-reservation-request';

const MAX_CLASS_DURATION_MINUTES = 45;
const MAX_BREAK_BETWEEN_CLASSES_MINUTES = 60;
const DEFAULT_CLASS_PRICE = 1300;

const MINUTE_MS = 60 * 1000;

function minutesBetween(from: string, to: string) {
  return (Date.parse(to) - Date.parse(from)) / MINUTE_MS;
}

function hasValidSchedule(item: ClassItemRequest) {
  return !!item.startsAt && !!item.endsAt && isValidDate(item.startsAt) && isValidDate(item.endsAt);
}

function findPreviousClass(classes: ClassItemRequest[], current: ClassItemRequest) {
  const previous = classes[classes.indexOf(current) - 1];
  return previous && hasValidSchedule(previous) ? previous : undefined;
}

function earliestClassDate(classes: ClassItemRequest[]) {
  const starts = classes
    .filter(hasValidSchedule)
    .map((c) => c.startsAt)
    .sort();

  return starts[0]?.slice(0, 10);
}

export function createEmptyClass(startsAt = new Date()): ClassItemRequest {
  const endsAt = new Date(startsAt.getTime() + MAX_CLASS_DURATION_MINUTES * MINUTE_MS);

  return {
    subjectId: 0,
    price: DEFAULT_CLASS_PRICE,
    startsAt: dateTimeInputValue(startsAt),
    endsAt: dateTimeInputValue(endsAt),
    reservedAt: dateInputValue(),
  };
}

export function createEmptyClassReservation(): ClassReservationFormModel {
  return {
    studentId: '',
    totalPrice: null,
    classesToDelete: [],
    reservedAt: dateInputValue(),
    description: '',
    reservationStatus: ReservationStatus.Confirmed,
    classes: [createEmptyClass()],
  };
}

export function createClassReservationFormModel(
  details: ClassReservationDetails,
): ClassReservationFormModel {
  return {
    studentId: details.studentId,
    totalPrice: details.totalPrice,
    reservationStatus: details.reservationStatus,
    // Backend details don't return the reservation date yet, so the earliest
    // class reservation date is used to keep the form valid
    reservedAt:
      details.classes
        .map((c) => c.reservedAt)
        .sort()
        .at(0) ?? dateInputValue(),
    description: details.description ?? '',
    classesToDelete: [],
    classes: details.classes.map((c) => ({
      subjectId: c.subjectId,
      price: c.price,
      startsAt: dateTimeInputValue(new Date(c.startsAt)),
      endsAt: dateTimeInputValue(new Date(c.endsAt)),
      reservedAt: c.reservedAt,
    })),
  };
}

export function createClassReservationRequest(
  model: ClassReservationFormModel,
): CreateClassReservationRequest {
  return {
    studentId: model.studentId,
    totalPrice: model.totalPrice,
    reservedAt: model.reservedAt,
    description: model.description || null,
    reservationStatus: model.reservationStatus,
    classes: model.classes.map((classItem) => ({
      ...classItem,
      startsAt: new Date(classItem.startsAt).toISOString(),
      endsAt: new Date(classItem.endsAt).toISOString(),
    })),
  };
}

export function createClassReservationForm(request: WritableSignal<ClassReservationFormModel>) {
  return form(request, (schemaPath) => {
    required(schemaPath.studentId, { message: 'Izaberi studenta.' });
    min(schemaPath.totalPrice, 0, { message: 'Ukupna cena rezervacije može biti najmanje 0 RSD.' });
    required(schemaPath.reservedAt, { message: 'Unesi datum rezervisanja' });
    validate(schemaPath.reservedAt, ({ value, valueOf }) => {
      if (!isValidDate(value())) {
        return { kind: 'invalidDate', message: 'Datum rezervacije nije validan' };
      }
      if (value() > dateInputValue()) {
        return { kind: 'futureDate', message: 'Datum rezervisanja ne može biti u budućnosti' };
      }
      const firstClassDate = earliestClassDate(valueOf(schemaPath.classes));
      if (firstClassDate && value() > firstClassDate) {
        return { kind: 'dateOrder', message: 'Datum rezervisanja ne može biti posle prvog časa' };
      }
      return null;
    });
    maxLength(schemaPath.description, 500, {
      message: 'Opis može imati najviše 500 karaktera',
    });
    minLength(schemaPath.classes, 1, { message: 'Rezervacija mora imati barem 1 čas' });
    applyEach(schemaPath.classes, (classItem) => {
      min(classItem.subjectId, 1, { message: 'Izaberi predmet časa.' });
      required(classItem.price, { message: 'Unesi cenu časa.' });
      validate(classItem.price, ({ value }) => {
        if (value() <= 0) {
          return { kind: 'min', message: 'Cena časa mora biti veća od 0 RSD.' };
        }
        return null;
      });
      required(classItem.startsAt, { message: 'Unesi početak časa' });
      required(classItem.endsAt, { message: 'Unesi kraj časa' });
      required(classItem.reservedAt, { message: 'Unesi datum rezervacije' });
      validate(classItem.startsAt, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Početak časa nije validan' };
        }

        const current = valueOf(classItem);
        if (!hasValidSchedule(current)) return null;

        const previous = findPreviousClass(valueOf(schemaPath.classes), current);
        if (!previous) return null;

        if (isBefore(current.startsAt, previous.startsAt)) {
          return {
            kind: 'classesOrder',
            message: 'Časovi moraju biti poređani hronološki',
          };
        }
        if (isBefore(current.startsAt, previous.endsAt)) {
          return { kind: 'classesOverlap', message: 'Čas se preklapa sa prethodnim časom' };
        }
        if (minutesBetween(previous.endsAt, current.startsAt) > MAX_BREAK_BETWEEN_CLASSES_MINUTES) {
          return {
            kind: 'breakDurationExceeded',
            message: `Pauza posle prethodnog časa ne može biti duža od ${MAX_BREAK_BETWEEN_CLASSES_MINUTES} minuta`,
          };
        }
        return null;
      });
      validate(classItem.endsAt, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Kraj časa nije validan' };
        }
        const startsAt = valueOf(classItem.startsAt);
        if (!startsAt || !isValidDate(startsAt)) return null;

        if (!isAfter(value(), startsAt)) {
          return { kind: 'dateOrder', message: 'Kraj časa mora biti posle početka' };
        }
        if (minutesBetween(startsAt, value()) > MAX_CLASS_DURATION_MINUTES) {
          return {
            kind: 'invalidDuration',
            message: `Čas ne može trajati duže od ${MAX_CLASS_DURATION_MINUTES} minuta`,
          };
        }
        return null;
      });
      validate(classItem.reservedAt, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Datum rezervacije nije validan' };
        }
        if (value() > dateInputValue()) {
          return {
            kind: 'futureDate',
            message: 'Datum rezervisanja časa ne može biti u budućnosti',
          };
        }
        if (isBefore(value(), valueOf(schemaPath.reservedAt))) {
          return {
            kind: 'dateOrder',
            message: 'Datum rezervisanja časa ne može biti pre datuma rezervacije',
          };
        }
        const startsAt = valueOf(classItem.startsAt);
        if (startsAt && isValidDate(startsAt) && value() > startsAt.slice(0, 10)) {
          return { kind: 'dateOrder', message: 'Datum rezervisanja mora biti pre početka časa' };
        }
        return null;
      });
    });
  });
}
