import { PagedResult } from '@core/models/paged-result';
import { InquiryItem } from './inquiry-item';

export type InquiriesSummary = {
  totalInquiries: number;
  unresolvedInquiries: number;
  resolvedInquiries: number;
  pagedInquiries: PagedResult<InquiryItem>;
};
