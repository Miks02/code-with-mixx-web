import { PaymentStatus } from '../models/payment-status';
import { ReservationStatus } from '../models/reservation-status';

export type ReservationStatusStyle = {
  label: string;
  dotClasses: string;
  selectedClasses: string;
};

export type StatusMeta = {
  label: string;
  classes: string;
};


export const RESERVATION_STATUS_STYLES: Record<ReservationStatus, ReservationStatusStyle> = {
  [ReservationStatus.Confirmed]: {
    label: 'Potvrđena',
    dotClasses: 'bg-emerald-500',
    selectedClasses: 'bg-emerald-600 text-white',
  },
  [ReservationStatus.Completed]: {
    label: 'Završena',
    dotClasses: 'bg-sky-500',
    selectedClasses: 'bg-sky-700 text-white',
  },
  [ReservationStatus.Cancelled]: {
    label: 'Otkazana',
    dotClasses: 'bg-red-500',
    selectedClasses: 'bg-red-700 text-white',
  },
};


export const RESERVATION_STATUS_META: Record<ReservationStatus, StatusMeta> = {
  [ReservationStatus.Confirmed]: {
    label: 'Potvrđena',
    classes: 'bg-emerald-900/80 text-emerald-100',
  },
  [ReservationStatus.Completed]: { label: 'Završena', classes: 'bg-sky-900/60 text-sky-100' },
  [ReservationStatus.Cancelled]: { label: 'Otkazana', classes: 'bg-red-950/60 text-red-100' },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  [PaymentStatus.Pending]: { label: 'Čeka uplatu', classes: 'bg-amber-900/60 text-amber-100' },
  [PaymentStatus.Paid]: { label: 'Plaćeno', classes: 'bg-emerald-950/80 text-emerald-100' },
  [PaymentStatus.PartiallyPaid]: {
    label: 'Delimično plaćeno',
    classes: 'bg-sky-900/60 text-sky-100',
  },
  [PaymentStatus.Overdue]: { label: 'Kasni uplata', classes: 'bg-red-900/60 text-red-100' },
  [PaymentStatus.Refunded]: { label: 'Refundirano', classes: 'bg-violet-900/60 text-violet-100' },
};


export const RESERVATION_STATUS_FILTER_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.Confirmed]: 'Potvrđene',
  [ReservationStatus.Completed]: 'Završene',
  [ReservationStatus.Cancelled]: 'Otkazane',
};

export const CONFLICTING_RESERVATION_STATUSES: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.Confirmed]: [ReservationStatus.Cancelled],
  [ReservationStatus.Completed]: [ReservationStatus.Cancelled],
  [ReservationStatus.Cancelled]: [ReservationStatus.Confirmed, ReservationStatus.Completed],
};
