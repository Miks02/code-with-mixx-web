import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import {
  CreateQueryResult,
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { PagedResult } from '@core/models/paged-result';
import { invalidateReservationQueries, reservationKeys } from '@features/reservations';
import { OpenBalanceSummary } from '../models/open-balance-summary';
import { PaymentQueryParams } from '../models/payment-query-params';
import { PaymentRequest } from '../models/payment-request';
import { PaymentTransactionItem } from '../models/payment-transaction-item';
import { PaymentsSummary } from '../models/payments-summary';
import { ReservationPaymentHistory } from '../models/reservation-payment-history';
import { paymentKeys } from '../utilities/payment-keys';

@Service()
export class PaymentService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  private apiUrl = environment.apiUrl;

  getPaymentsSummaryQuery(queryParams: Signal<PaymentQueryParams>) {
    const url = `${this.apiUrl}/admin/payments/summary`;

    return injectQuery<PaymentsSummary>(() => ({
      queryKey: paymentKeys.summary(),
      queryFn: async () => {
        const response = await lastValueFrom(
          this.http.get<PaymentsSummary>(url, { params: queryParams() }),
        );

        this.queryClient.setQueryData(paymentKeys.page(queryParams()), response.pagedPayments);
        return response;
      },
    }));
  }

  getPagedPaymentsQuery(
    queryParams: Signal<PaymentQueryParams>,
    queryResult: CreateQueryResult<PaymentsSummary>,
  ) {
    const url = `${this.apiUrl}/admin/payments`;

    return injectQuery<PagedResult<PaymentTransactionItem>>(() => ({
      queryKey: paymentKeys.page(queryParams()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<PaymentTransactionItem>>(url, { params: queryParams() }),
        ),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess() && !queryResult.isFetching(),
    }));
  }

  getOpenBalanceQuery() {
    return injectQuery<OpenBalanceSummary>(() => ({
      queryKey: paymentKeys.openBalance(),
      queryFn: () =>
        lastValueFrom(
          this.http.get<OpenBalanceSummary>(`${this.apiUrl}/admin/reservations/open-balance`),
        ),
    }));
  }

  getStudentPaymentsSummaryQuery(queryParams: Signal<PaymentQueryParams>) {
    const url = `${this.apiUrl}/student/payments/summary`;

    return injectQuery<PaymentsSummary>(() => ({
      queryKey: paymentKeys.summary(),
      queryFn: async () => {
        const response = await lastValueFrom(
          this.http.get<PaymentsSummary>(url, { params: queryParams() }),
        );

        this.queryClient.setQueryData(paymentKeys.page(queryParams()), response.pagedPayments);
        return response;
      },
    }));
  }

  getStudentPagedPaymentsQuery(
    queryParams: Signal<PaymentQueryParams>,
    queryResult: CreateQueryResult<PaymentsSummary>,
  ) {
    const url = `${this.apiUrl}/student/payments`;

    return injectQuery<PagedResult<PaymentTransactionItem>>(() => ({
      queryKey: paymentKeys.page(queryParams()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<PaymentTransactionItem>>(url, { params: queryParams() }),
        ),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess() && !queryResult.isFetching(),
    }));
  }

  getStudentOpenBalanceQuery() {
    return injectQuery<OpenBalanceSummary>(() => ({
      queryKey: paymentKeys.openBalance(),
      queryFn: () =>
        lastValueFrom(
          this.http.get<OpenBalanceSummary>(`${this.apiUrl}/student/reservations/open-balance`),
        ),
    }));
  }

  getAdminPaymentHistoryForReservationQuery(
    reservationId: Signal<number>,
    enabled: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: reservationKeys.payments(reservationId()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<ReservationPaymentHistory>(
            `${this.apiUrl}/admin/reservations/${reservationId()}/payments`,
          ),
        ),
      enabled: enabled() && reservationId() > 0,
    }));
  }

  getStudentPaymentHistoryForReservationQuery(
    reservationId: Signal<number>,
    enabled: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: reservationKeys.payments(reservationId()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<ReservationPaymentHistory>(
            `${this.apiUrl}/student/reservations/${reservationId()}/payments`,
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

  private invalidateQueries(reservationId: number) {
    this.queryClient.invalidateQueries({ queryKey: paymentKeys.pages(), refetchType: 'none' });
    this.queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
    this.queryClient.invalidateQueries({ queryKey: paymentKeys.openBalance() });
    return invalidateReservationQueries(this.queryClient, reservationId);
  }
}
