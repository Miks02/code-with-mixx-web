import { InquiriesFilterBy } from './inquiries-filter-by';
import { InquiriesSortBy } from './inquiries-sort-by';

export type InquiryQueryParams = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortBy: InquiriesSortBy;
  filters: InquiriesFilterBy[];
};
