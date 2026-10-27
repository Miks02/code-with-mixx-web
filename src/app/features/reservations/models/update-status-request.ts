import { ReservationStatus } from './reservation-status';

export type UpdateStatusRequest = {
  reservationId: number;
  reservationStatus: ReservationStatus;
};

export type UpdateStatusFormModel = Omit<UpdateStatusRequest, 'reservationId'>;
