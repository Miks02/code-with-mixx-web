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
import { ProjectReservationFormModel } from '../models/project-reservation-request';

function isValidDate(date: string) {
  return !date || !Number.isNaN(Date.parse(date));
}

function isAfter(date: string, other: string) {
  if (!date || !other || !isValidDate(date) || !isValidDate(other)) return false;

  return Date.parse(date) > Date.parse(other);
}

export function createProjectReservationFormFactory(
  request: WritableSignal<ProjectReservationFormModel>,
) {
  return form(request, (schemaPath) => {
    required(schemaPath.studentId, { message: 'Izaberite studenta.' });
    min(schemaPath.totalPrice, 0, { message: 'Ukupna cena rezervacije može biti najmanje 0 RSD.' })
    min(schemaPath.paidAmount, 0, { message: 'Vrednost mora biti 0 ili više' })
    validate(schemaPath.paidAmount, ({ value, valueOf }) => {
      if (value() > valueOf(schemaPath.totalPrice)) {
        return { kind: 'paidOverTotal', message: 'Plaćeno ne može biti veće od ukupne cene' };
      }
      return null;
    });
    minLength(schemaPath.projects, 1, { message: 'Rezervacija mora imati barem 1 projekat' });
    applyEach(schemaPath.projects, (project) => {
      min(project.subjectId, 1, { message: 'Izaberite predmet projekta.' });
      required(project.price, { message: 'Unesite cenu projekta.' });
      min(project.price, 0, { message: 'Cena ne može biti manja od 0 RSD.' });
      required(project.startDate, { message: 'Unesite datum početka projekta' });
      required(project.endDate, { message: 'Unesite datum završetka projekta' });
      required(project.reservedAt, { message: 'Unesite datum rezervacije' });
      validate(project.startDate, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Datum početka nije validan' };
        }
        if (isAfter(value(), valueOf(project.endDate))) {
          return { kind: 'dateOrder', message: 'Početak ne može biti posle roka' };
        }
        return null;
      });
      validate(project.endDate, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Rok nije validan' };
        }
        if (isAfter(valueOf(project.startDate), value())) {
          return { kind: 'dateOrder', message: 'Rok ne može biti pre početka' };
        }
        return null;
      });
      validate(project.reservedAt, ({ value, valueOf }) => {
        if (!isValidDate(value())) {
          return { kind: 'invalidDate', message: 'Datum rezervacije nije validan' };
        }
        if (isAfter(value(), valueOf(project.endDate))) {
          return { kind: 'dateOrder', message: 'Rezervacija ne može biti posle roka' };
        }
        return null;
      });
      maxLength(project.githubLink, 200, {
        message: 'Github link ne može imati više od 200 karaktera',
      });
      maxLength(project.downloadLink, 200, {
        message: 'Download link ne može imati više od 200 karaktera ',
      });
      applyEach(project.notes, (notes) => {
        required(notes, { message: 'Beleške ne mogu biti prazne' });
      });
    });
  });
}
