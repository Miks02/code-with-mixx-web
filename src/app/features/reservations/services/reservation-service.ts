import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { UpdateStatusRequest } from '../models/update-status-request';
import { invalidateReservationQueries } from '../utilities/reservation-queries';

@Service()
export class ReservationService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  private apiUrl = environment.apiUrl;

  updateStatusMutation = injectMutation(() => ({
    mutationFn: (request: UpdateStatusRequest) =>
      lastValueFrom(
        this.http.patch(`${this.apiUrl}/admin/reservations/${request.reservationId}/status`, {
          reservationStatus: request.reservationStatus,
        }),
      ),
    onSuccess: (_, request) =>
      invalidateReservationQueries(this.queryClient, request.reservationId),
  }));
}
