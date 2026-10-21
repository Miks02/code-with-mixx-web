import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentRequest } from '../models/payment-request';
import { ReservationPaymentHistory } from '../models/reservation-payment-history';
import { UpdateStatusRequest } from '../models/update-status-request';
import { projectReservationKeys } from '../utilities/reservation-keys';
import { reservationKeys } from '../utilities/reservation-keys';

@Service()
export class ReservationService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  private apiUrl = environment.apiUrl;

  getPaymentHistoryForReservationQuery(reservationId: Signal<number>, enabled: Signal<boolean>) {
    return injectQuery(() => ({
      queryKey: reservationKeys.payments(reservationId()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<ReservationPaymentHistory>(
            `${this.apiUrl}/reservations/${reservationId()}/payments`,
          ),
        ),
      enabled: enabled() && reservationId() > 0,
    }));
  }

  registerPaymentMutation = injectMutation(() => ({
    mutationFn: (request: PaymentRequest) =>
      lastValueFrom(
        this.http.post(
          `${this.apiUrl}/admin/reservations/${request.reservationId}/payments/register`,

          request,
        ),
      ),
    onSuccess: (_, request) => this.invalidateQueries(request.reservationId),
  }));

  subtractPaymentMutation = injectMutation(() => ({
    mutationFn: (request: PaymentRequest) =>
      lastValueFrom(
        this.http.post(
          `${this.apiUrl}/admin/reservations/${request.reservationId}/payments/subtract`,
          request,
        ),
      ),
    onSuccess: (_, request) => this.invalidateQueries(request.reservationId),
  }));

  updateStatusMutation = injectMutation(() => ({
    mutationFn: (request: UpdateStatusRequest) =>
      lastValueFrom(
        this.http.patch(`${this.apiUrl}/admin/reservations/${request.reservationId}/status`, {
          reservationStatus: request.reservationStatus,
        }),
      ),
    onSuccess: (_, request) => this.invalidateQueries(request.reservationId),
  }));

  private invalidateQueries(reservationId: number) {
    this.queryClient.invalidateQueries({
      queryKey: projectReservationKeys.pages(),
      refetchType: 'none',
    });
    this.queryClient.invalidateQueries({
      queryKey: projectReservationKeys.detail(reservationId),
    });
    this.queryClient.invalidateQueries({ queryKey: reservationKeys.payments(reservationId) });
    return this.queryClient.invalidateQueries({ queryKey: projectReservationKeys.summary() });
  }
}
