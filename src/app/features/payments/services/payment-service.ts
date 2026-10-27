import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { reservationKeys } from '@features/reservations/utilities/reservation-keys';
import { invalidateReservationQueries } from '@features/reservations/utilities/reservation-queries';
import { PaymentRequest } from '../models/payment-request';
import { ReservationPaymentHistory } from '../models/reservation-payment-history';

@Service()
export class PaymentService {
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
    onSuccess: (_, request) =>
      invalidateReservationQueries(this.queryClient, request.reservationId),
  }));

  subtractPaymentMutation = injectMutation(() => ({
    mutationFn: (request: PaymentRequest) =>
      lastValueFrom(
        this.http.post(
          `${this.apiUrl}/admin/reservations/${request.reservationId}/payments/subtract`,
          request,
        ),
      ),
    onSuccess: (_, request) =>
      invalidateReservationQueries(this.queryClient, request.reservationId),
  }));
}
