import { InquiryType } from './inquiry-type';

export type CreateInquiryRequest = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
};
