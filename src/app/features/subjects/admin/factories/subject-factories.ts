import { WritableSignal } from '@angular/core';
import { form, minLength, required } from '@angular/forms/signals';
import { CreateSubjectRequest } from '../../models/create-subject-request';

export function createSubjectForm(request: WritableSignal<CreateSubjectRequest>) {
  return form(request, (schemaPath) => {
    required(schemaPath.subjectName, { message: 'Naziv predmeta je obavezan' });
    minLength(schemaPath.subjectName, 3, {
      message: 'Naziv predmeta mora imati najmanje 3 karaktera',
    });
    required(schemaPath.subjectDescription, { message: 'Opis predmeta je obavezan' });
    minLength(schemaPath.subjectDescription, 10, {
      message: 'Opis predmeta mora imati najmanje 10 karaktera',
    });
  });
}
