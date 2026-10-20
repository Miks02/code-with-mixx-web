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
import { projectReservationKeys } from '../../reservations';

@Service()
export class ProjectService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getProjectsSummaryQuery(queryParams: Signal<ProjectQueryParams>) {
    const url = `${this.apiUrl}/admin/reservations/projects/summary`;

    const params = queryParams();

    return injectQuery<ProjectsSummary>(() => ({
      queryKey: projectReservationKeys.summary(params),
      queryFn: async () => {
        const response = await lastValueFrom(this.http.get<ProjectsSummary>(url, { params }));

        this.queryClient.setQueryData(
          projectReservationKeys.page(queryParams()),
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
      queryKey: projectReservationKeys.page(queryParams()),
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
      queryKey: projectReservationKeys.detail(reservationId()),
      queryFn: () =>
        lastValueFrom(
          this.http.get<ProjectReservationDetails>(
            `${this.apiUrl}/admin/reservations/projects/${reservationId()}`,
          ),
        ),
      enabled: reservationId() !== undefined,
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
    onSuccess: (_, request) => this.invalidateQueries(request.id),
  }));

  archiveProjectReservationMutation = injectMutation(() => ({
    mutationFn: (reservationId: number) =>
      lastValueFrom(
        this.http.post(`${this.apiUrl}/admin/reservations/projects/${reservationId}/archive`, {}),
      ),
    onSuccess: (_, reservationId) => this.invalidateQueries(reservationId),
  }));

  restoreProjectReservationMutation = injectMutation(() => ({
    mutationFn: (reservationId: number) =>
      lastValueFrom(
        this.http.post(`${this.apiUrl}/admin/reservations/projects/${reservationId}/restore`, {}),
      ),
    onSuccess: (_, reservationId) => this.invalidateQueries(reservationId),
  }));

  private invalidateQueries(reservationId?: number) {
    this.queryClient.invalidateQueries({
      queryKey: projectReservationKeys.pages(),
      refetchType: 'none',
    });
    if (reservationId !== undefined) {
      this.queryClient.invalidateQueries({
        queryKey: projectReservationKeys.detail(reservationId),
      });
    }
    return this.queryClient.invalidateQueries({ queryKey: projectReservationKeys.summaries() });
  }
}
