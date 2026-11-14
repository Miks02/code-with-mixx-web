import { StatusMeta } from '@features/reservations';
import { InquiriesFilterBy } from '../models/inquiries-filter-by';
import { InquiriesSortBy } from '../models/inquiries-sort-by';
import { InquiryType } from '../models/inquiry-type';

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  [InquiryType.IndividualClasses]: 'Individualni časovi',
  [InquiryType.ClassPackage]: 'Paket časova',
  [InquiryType.Project]: 'Seminarski / diplomski rad',
  [InquiryType.Other]: 'Ostalo',
};

export type InquiryStatusFilter = InquiriesFilterBy.Resolved | InquiriesFilterBy.Unresolved;

export type InquiryTypeFilter = Exclude<InquiriesFilterBy, InquiryStatusFilter>;

export const INQUIRY_STATUS_FILTER_LABELS: Record<InquiryStatusFilter, string> = {
  [InquiriesFilterBy.Unresolved]: 'Nerešeni',
  [InquiriesFilterBy.Resolved]: 'Rešeni',
};

export const CONFLICTING_INQUIRY_STATUS_FILTERS: Record<
  InquiryStatusFilter,
  InquiryStatusFilter[]
> = {
  [InquiriesFilterBy.Unresolved]: [InquiriesFilterBy.Resolved],
  [InquiriesFilterBy.Resolved]: [InquiriesFilterBy.Unresolved],
};

export const INQUIRY_TYPE_FILTER_LABELS: Record<InquiryTypeFilter, string> = {
  [InquiriesFilterBy.IndividualClasses]: INQUIRY_TYPE_LABELS[InquiryType.IndividualClasses],
  [InquiriesFilterBy.ClassPackage]: INQUIRY_TYPE_LABELS[InquiryType.ClassPackage],
  [InquiriesFilterBy.Project]: INQUIRY_TYPE_LABELS[InquiryType.Project],
  [InquiriesFilterBy.Other]: INQUIRY_TYPE_LABELS[InquiryType.Other],
};

export const INQUIRY_SORT_LABELS: Record<InquiriesSortBy, string> = {
  [InquiriesSortBy.CreatedAtDescending]: 'Po datumu - noviji',
  [InquiriesSortBy.CreatedAtAscending]: 'Po datumu - stariji',
  [InquiriesSortBy.ResolvedAtDescending]: 'Po rešavanju - noviji',
  [InquiriesSortBy.ResolvedAtAscending]: 'Po rešavanju - stariji',
  [InquiriesSortBy.NameAscending]: 'Po imenu (A-Z)',
  [InquiriesSortBy.NameDescending]: 'Po imenu (Z-A)',
};

export const INQUIRY_STATUS_META: Record<'resolved' | 'unresolved', StatusMeta> = {
  resolved: { label: 'Rešen', classes: 'bg-emerald-800 text-emerald-100' },
  unresolved: { label: 'Nerešen', classes: 'bg-amber-900/60 text-amber-100' },
};
