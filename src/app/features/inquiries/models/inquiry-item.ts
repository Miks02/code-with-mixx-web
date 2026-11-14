import { InquiryType } from './inquiry-type';

export type InquiryItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  inquiryType: InquiryType;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedByAdminId: string | null;
  resolvedByAdminName: string | null;
  createdAt: string;
};
