import { QueryClient } from '@tanstack/angular-query-experimental';
import { projectReservationKeys, reservationKeys } from './reservation-keys';

export function invalidateReservationQueries(queryClient: QueryClient, reservationId: number) {
  queryClient.invalidateQueries({
    queryKey: projectReservationKeys.pages(),
    refetchType: 'none',
  });
  queryClient.invalidateQueries({
    queryKey: projectReservationKeys.detail(reservationId),
  });
  queryClient.invalidateQueries({ queryKey: reservationKeys.payments(reservationId) });
  return queryClient.invalidateQueries({ queryKey: projectReservationKeys.summary() });
}
