import { WritableSignal } from '@angular/core';
import {
  debounce,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { CreateInquiryRequest } from '../models/create-inquiry-request';
import { InquiryType } from '../models/inquiry-type';

export function createEmptyInquiryRequest(): CreateInquiryRequest {
  return {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    inquiryType: InquiryType.IndividualClasses,
    message: '',
  };
}

export function createInquiryForm(request: WritableSignal<CreateInquiryRequest>) {
  return form(request, (schemaPath) => {
    debounce(schemaPath.email, 100);
    required(schemaPath.firstName, { message: 'Unesi ime' });
    maxLength(schemaPath.firstName, 50, { message: 'Ime može imati najviše 50 karaktera' });
    required(schemaPath.lastName, { message: 'Unesi prezime' });
    maxLength(schemaPath.lastName, 50, { message: 'Prezime može imati najviše 50 karaktera' });
    required(schemaPath.phoneNumber, { message: 'Unesi broj telefona' });
    pattern(schemaPath.phoneNumber, /^\+?\d{10,15}$/, {
      message: 'Broj telefona nije validan',
    });
    required(schemaPath.email, { message: 'Unesi email adresu' });
    email(schemaPath.email, { message: 'Email adresa nije validna' });
    maxLength(schemaPath.email, 256, {
      message: 'Email adresa može imati najviše 256 karaktera',
    });
    required(schemaPath.inquiryType, { message: 'Izaberi vrstu upita' });
    required(schemaPath.message, { message: 'Unesi poruku' });
    minLength(schemaPath.message, 10, { message: 'Poruka mora imati najmanje 10 karaktera' });
    maxLength(schemaPath.message, 500, { message: 'Poruka može imati najviše 500 karaktera' });
  });
}
