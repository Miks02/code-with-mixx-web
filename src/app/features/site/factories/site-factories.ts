import { WritableSignal } from '@angular/core';
import { debounce, email, form, maxLength, pattern, required } from '@angular/forms/signals';
import { ContactRequest } from '../models/contact-request';
import { InquiryType } from '../models/inquiry-type';

export function createEmptyContactRequest(): ContactRequest {
  return {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    inquiryType: InquiryType.IndividualClasses,
    message: '',
  };
}

export function createContactForm(request: WritableSignal<ContactRequest>) {
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
    required(schemaPath.inquiryType, { message: 'Izaberi vrstu upita' });
    required(schemaPath.message, { message: 'Unesi poruku' });
    maxLength(schemaPath.message, 1000, { message: 'Poruka može imati najviše 1000 karaktera' });
  });
}
