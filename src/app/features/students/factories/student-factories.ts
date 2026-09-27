import { WritableSignal } from '@angular/core';
import { debounce, email, form, required } from '@angular/forms/signals';
import { CreateStudentFormModel } from '../models/create-student-request';
import { UpdateStudentFormModel } from '../models/update-student-request';

export function createStudentForm(request: WritableSignal<CreateStudentFormModel>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.email, 100);
    required(schemaPath.firstName, { message: 'Ime je obavezno.' });
    required(schemaPath.lastName, { message: 'Prezime je obavezno.' });
    required(schemaPath.email, { message: 'Email je obavezan.' });
    email(schemaPath.email, { message: 'Email adresa nije validna.' });
    required(schemaPath.phoneNumber, { message: 'Broj telefona je obavezan.' });
  });
}

export function createUpdateStudentForm(request: WritableSignal<UpdateStudentFormModel>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.email, 100);
    required(schemaPath.firstName, { message: 'Ime je obavezno.' });
    required(schemaPath.lastName, { message: 'Prezime je obavezno.' });
    required(schemaPath.email, { message: 'Email je obavezan.' });
    email(schemaPath.email, { message: 'Email adresa nije validna.' });
    required(schemaPath.phoneNumber, { message: 'Broj telefona je obavezan.' });
  });
}
