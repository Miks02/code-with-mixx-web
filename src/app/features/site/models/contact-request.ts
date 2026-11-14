import { InquiryType } from './inquiry-type';

export type ContactRequest = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
};
