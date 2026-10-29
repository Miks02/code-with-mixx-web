import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { environment } from '@environments/environment';
import {
  CreateQueryResult,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { PagedResult } from '@core/models/paged-result';
import { classReservationKeys } from '@features/reservations';
import { ClassQueryParams } from '../models/class-query-params';
import { ClassReservationItem } from '../models/class-reservation-item';
import { ClassesSummary } from '../models/classes-summary';

@Service()
export class ClassService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getClassesSummaryQuery(queryParams: Signal<ClassQueryParams>) {
    const url = `${this.apiUrl}/admin/reservations/classes/summary`;

    return injectQuery<ClassesSummary>(() => ({
      queryKey: classReservationKeys.summary(),
      queryFn: async () => {
        const response = await lastValueFrom(
          this.http.get<ClassesSummary>(url, { params: queryParams() }),
        );

        this.queryClient.setQueryData(
          classReservationKeys.page(queryParams()),
          response.reservations,
        );
        return response;
      },
    }));
  }

  getPagedClassReservationsQuery(
    queryParams: Signal<ClassQueryParams>,
    queryResult: CreateQueryResult<ClassesSummary>,
  ) {
    const url = `${this.apiUrl}/admin/reservations/classes`;

    return injectQuery<PagedResult<ClassReservationItem>>(() => ({
      queryKey: classReservationKeys.page(queryParams()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<ClassReservationItem>>(url, { params: queryParams() }),
        ),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess() && !queryResult.isFetching(),
    }));
  }
}
