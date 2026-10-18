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
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../core/models/paged-result';
import { ProjectQueryParams } from '../models/project-query-params';
import { ProjectReservationDetails } from '../models/project-reservation-details';
import { ProjectReservationItem } from '../models/project-reservation-item';
import { ProjectReservationRequest } from '../models/project-reservation-request';
import { ProjectsSummary } from '../models/projects-summary';
import { UpdateProjectReservationRequest } from '../models/update-project-reservation-request';

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

  getProjectReservationDetailsQuery(reservationId: Signal<number>) {
    return injectQuery<ProjectReservationDetails>(() => ({
      queryKey: ['project-reservation-details', reservationId()],
      queryFn: () =>
        lastValueFrom(
          this.http.get<ProjectReservationDetails>(
            `${this.apiUrl}/admin/reservations/projects/${reservationId()}`,
          ),
        ),
      enabled: reservationId !== undefined,
    }));
  }

  createProjectReservationMutation = injectMutation(() => ({
    mutationFn: (request: ProjectReservationRequest) =>
      lastValueFrom(this.http.post(`${this.apiUrl}/admin/reservations/projects`, request)),
    onSuccess: () => this.invalidateQueries(),
  }));

  updateProjectReservationMutation = injectMutation(() => ({
    mutationFn: (request: UpdateProjectReservationRequest) =>
      lastValueFrom(
        this.http.put(`${this.apiUrl}/admin/reservations/projects/${request.id}`, request),
      ),
    onSuccess: () => this.invalidateQueries(),
  }));

  archiveProjectReservationMutation = injectMutation(() => ({
    mutationFn: (reservationId: number) =>
      lastValueFrom(
        this.http.post(`${this.apiUrl}/admin/reservations/projects/${reservationId}/archive`, {}),
      ),
    onSuccess: () =>
      this.queryClient.invalidateQueries({
        queryKey: ['paged-project-reservations'],
      }),
  }));

  restoreProjectReservationMutation = injectMutation(() => ({
    mutationFn: (reservationId: number) =>
      lastValueFrom(
        this.http.post(`${this.apiUrl}/admin/reservations/projects/${reservationId}/restore`, {}),
      ),
    onSuccess: () =>
      this.queryClient.invalidateQueries({
        queryKey: ['paged-project-reservations'],
      }),
  }));

  private invalidateQueries() {
    this.queryClient.invalidateQueries({
      queryKey: ['paged-project-reservations'],
      refetchType: 'none',
    });
    this.queryClient.invalidateQueries({ queryKey: ['project-reservation-details'] });
    return this.queryClient.invalidateQueries({ queryKey: ['projects-summary'] });
  }
}
