import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentRequest } from '../models/payment-request';
import { UpdateStatusRequest } from '../models/update-status-request';
import { projectReservationKeys } from '../utilities/reservation-keys';

@Service()
export class ReservationService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  private apiUrl = environment.apiUrl;

  registerPaymentMutation = injectMutation(() => ({
    mutationFn: (request: PaymentRequest) =>
      lastValueFrom(
        this.http.post(
          `${this.apiUrl}/admin/reservations/${request.reservationId}/payments/submit`,
          {
            amount: request.amount,
          },
        ),
      ),
    onSuccess: (_, request) => this.invalidateQueries(request.reservationId),
  }));

  subtractPaymentMutation = injectMutation(() => ({
    mutationFn: (request: PaymentRequest) =>
      lastValueFrom(
        this.http.post(
          `${this.apiUrl}/admin/reservations/${request.reservationId}/payments/subtract`,
          {
            amount: request.amount,
          },
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
    return this.queryClient.invalidateQueries({ queryKey: projectReservationKeys.summaries() });
  }
}
