import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import {
  CreateQueryResult,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../core/models/paged-result';
import { ProjectQueryParams } from '../models/project-query-params';
import { ProjectReservationItem } from '../models/project-reservation-item';
import { ProjectsSummary } from '../models/projects-summary';

@Service()
export class ProjectService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getProjectsSummaryQuery(queryParams: Signal<ProjectQueryParams>) {
    const url = `${this.apiUrl}/admin/reservations/projects/summary`;

    const params = queryParams();

    return injectQuery<ProjectsSummary>(() => ({
      queryKey: ['projects-summary', params],
      queryFn: async () => {
        const response = await lastValueFrom(this.http.get<ProjectsSummary>(url, { params }));

        this.queryClient.setQueryData(
          ['paged-project-reservations', params],
          response.reservations,
        );

        return response;
      },
    }));
  }

  getPagedProjectReservationsQuery(
    queryParams: Signal<ProjectQueryParams>,
    queryResult: CreateQueryResult<ProjectsSummary>,
  ) {
    const url = `${this.apiUrl}/admin/reservations/projects`;

    return injectQuery<PagedResult<ProjectReservationItem>>(() => ({
      queryKey: ['paged-project-reservations', queryParams()],
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<ProjectReservationItem>>(url, { params: queryParams() }),
        ),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess(),
    }));
  }
}
