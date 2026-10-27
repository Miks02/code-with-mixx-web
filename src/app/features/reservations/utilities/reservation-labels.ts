import { ReservationStatus } from '../models/reservation-status';

export type ReservationStatusStyle = {
  label: string;
  dotClasses: string;
  selectedClasses: string;
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
