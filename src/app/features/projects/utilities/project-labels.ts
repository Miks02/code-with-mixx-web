import { PaymentStatus, ReservationStatus } from '../../reservations';
import { ProjectType } from '../models/project-type';

export type StatusMeta = {
  label: string;
  classes: string;
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  [ProjectType.Seminar]: 'Seminarski',
  [ProjectType.Graduation]: 'Diplomski',
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
  [PaymentStatus.Paid]: { label: 'Plaćeno', classes: 'bg-emerald-900/80 text-emerald-100' },
  [PaymentStatus.PartiallyPaid]: {
    label: 'Delimično plaćeno',
    classes: 'bg-sky-900/60 text-sky-100',
  },
  [PaymentStatus.Overdue]: { label: 'Kasni uplata', classes: 'bg-red-950/60 text-red-100' },
  [PaymentStatus.Refunded]: { label: 'Refundirano', classes: 'bg-orange-950/60 text-orange-100' },
};
