import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentRequest } from '../models/payment-request';

@Service()
export class ReservationService {
  private http = inject(HttpClient);

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
  }));
}
