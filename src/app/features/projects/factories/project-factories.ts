import { Signal, WritableSignal } from '@angular/core';
import {
  applyEach,
  disabled,
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { dateInputValue } from '../../../core/utilities/date-helpers';
import { ReservationStatus } from '../../reservations';
import { ProjectDetails } from '../models/project-details';
import { ProjectReservationDetails } from '../models/project-reservation-details';
import {
  ProjectItemFormModel,
  ProjectReservationFormModel,
} from '../models/project-reservation-request';
import { ProjectType } from '../models/project-type';
import { UpdateProjectFormModel } from '../models/update-project-request';

const DEFAULT_PROJECT_DURATION_DAYS = 7;

export function createEmptyProject(): ProjectItemFormModel {
  return {
    id: 0,
    subjectId: 0,
    startDate: dateInputValue(),
    subjectName: '',
    endDate: dateInputValue(DEFAULT_PROJECT_DURATION_DAYS),
    githubLink: '',
    downloadLink: '',
    price: 0,
    progress: 0,
    projectType: ProjectType.Seminar,
    reservedAt: dateInputValue(),
    notes: [],
    notesToDelete: [],
  };
}

export function createEmptyReservation(): ProjectReservationFormModel {
  return {
    id: 0,
    studentId: '',
    totalPrice: 0,
    projectsToDelete: [],
    reservedAt: dateInputValue(),
    reservationStatus: ReservationStatus.Confirmed,
    projects: [createEmptyProject()],
  };
}

export function createReservationFormModel(
  details: ProjectReservationDetails,
): ProjectReservationFormModel {
  return {
    id: details.id,
    studentId: details.studentId,
    totalPrice: details.totalPrice,
    reservationStatus: details.reservationStatus,
    reservedAt: details.reservedAt ?? '',
    projectsToDelete: [],
    projects: details.projects.map((project) => ({
      id: project.id,
      subjectId: project.subjectId,
      subjectName: project.subjectName,
      projectType: project.projectType,
      price: project.price,
      progress: project.progress,
      reservedAt: project.reservedAt,
      startDate: project.startDate,
      endDate: project.endDate,
      githubLink: project.githubLink ?? '',
      downloadLink: project.downloadLink ?? '',
      notes: project.notes.map((note) => ({ ...note })),
      notesToDelete: [],
    })),
  };
}

function isValidDate(date: string): boolean {
  return !date || !Number.isNaN(Date.parse(date));
}

function isAfter(date: string, other: string): boolean {
  if (!date || !other || !isValidDate(date) || !isValidDate(other)) return false;

  return Date.parse(date) > Date.parse(other);
}

function isBefore(date: string, other: string): boolean {
  if (!date || !other || !isValidDate(date) || !isValidDate(other)) return false;

  return Date.parse(date) < Date.parse(other);
}

export function createProjectReservationFormFactory(
  request: WritableSignal<ProjectReservationFormModel>,
) {
  return form(request, (schemaPath) => {
    required(schemaPath.studentId, { message: 'Izaberite studenta.' });
    min(schemaPath.totalPrice, 0, { message: 'Ukupna cena rezervacije može biti najmanje 0 RSD.' });
    required(schemaPath.reservedAt, { message: 'Unesite datum rezervisanja' });
    validate(schemaPath.reservedAt, ({ value }) => {
      if (!isValidDate(value())) {
        return { kind: 'invalidDate', message: 'Datum rezervacije nije validan' };
      }
      if (value() > dateInputValue()) {
        return { kind: 'futureDate', message: 'Datum rezervisanja ne može biti u budućnosti' };
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
        if (isBefore(value(), request().reservedAt)) {
          return { kind: 'dateOrder', message: 'Početak ne može biti pre datuma rezervisanja' };
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
        if (value() > dateInputValue()) {
          return {
            kind: 'futureDate',
            message: 'Datum rezervisanja projekta ne može biti u budućnosti',
          };
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
      applyEach(project.notes, (note) => {
        required(note.content, { message: 'Beleške ne mogu biti prazne' });
      });
    });
  });
}

export function createUpdateProjectFormModel(project?: ProjectDetails): UpdateProjectFormModel {
  return {
    price: project?.price ?? 0,
    progress: project?.progress ?? 0,
    githubLink: project?.githubLink ?? '',
    downloadLink: project?.downloadLink ?? '',
    notes: project?.notes.map(({ id, content }) => ({ id, content })) ?? [],
    notesToDelete: [],
  };
}

export function createUpdateProjectForm(
  request: WritableSignal<UpdateProjectFormModel>,
  isReadOnly: Signal<boolean>,
) {
  return form(request, (schemaPath) => {
    disabled(schemaPath, { when: () => isReadOnly() });
    required(schemaPath.price, { message: 'Unesite cenu projekta.' });
    min(schemaPath.price, 0, { message: 'Cena ne može biti manja od 0 RSD.' });
    min(schemaPath.progress, 0, { message: 'Napredak ne može biti manji od 0%.' });
    max(schemaPath.progress, 100, { message: 'Napredak ne može biti veći od 100%.' });
    maxLength(schemaPath.githubLink, 200, {
      message: 'Github link ne može imati više od 200 karaktera',
    });
    maxLength(schemaPath.downloadLink, 200, {
      message: 'Download link ne može imati više od 200 karaktera',
    });
    applyEach(schemaPath.notes, (note) => {
      required(note.content, { message: 'Beleške ne mogu biti prazne' });
      maxLength(note.content, 500, { message: 'Beleška ne može imati više od 500 karaktera' });
    });
  });
}
