import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const INQUIRY_ERROR_MESSAGES: Record<string, string> = {
  'Inquiry.FirstNameRequired': 'Unesi ime.',
  'Inquiry.FirstNameTooLong': 'Ime može imati najviše 50 karaktera.',
  'Inquiry.LastNameRequired': 'Unesi prezime.',
  'Inquiry.LastNameTooLong': 'Prezime može imati najviše 50 karaktera.',
  'Inquiry.EmailRequired': 'Unesi email adresu.',
  'Inquiry.EmailTooLong': 'Email adresa može imati najviše 256 karaktera.',
  'Inquiry.InvalidEmail': 'Email adresa nije validna.',
  'Inquiry.PhoneNumberRequired': 'Unesi broj telefona.',
  'Inquiry.InvalidPhoneNumber': 'Broj telefona nije validan.',
  'Inquiry.MessageRequired': 'Unesi poruku.',
  'Inquiry.MessageTooShort': 'Poruka mora imati najmanje 10 karaktera.',
  'Inquiry.MessageTooLong': 'Poruka može imati najviše 500 karaktera.',
  'Inquiry.InvalidInquiryType': 'Izabrana vrsta upita nije validna.',
};

export function getInquiryErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors) return 'Podaci nisu ispravni. Proveri polja forme.';

  return INQUIRY_ERROR_MESSAGES[err.errorCode];
}
