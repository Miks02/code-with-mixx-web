import { inject, Service, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StudentSort } from '../models/student-sort';
import { StudentFilter } from '../models/student-filter';
import {
  CreateQueryResult,
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { StudentQueryParams } from '../models/student-query-params';
import { StudentsSummary } from '../models/students-summary';
import { PagedResult } from '../../../core/models/paged-result';
import { StudentItem } from '../models/student-item';
import { ProblemDetails } from '../../../core/models/problem-details';

@Service()
export class StudentService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getStudentsSummaryQuery(queryParams: Signal<StudentQueryParams>) {
    const url = `${this.apiUrl}/admin/students/summary`;

    const params = queryParams();

    return injectQuery<StudentsSummary>(() => ({
      queryKey: ['students-summary', params],
      queryFn: async () => {
        const response = await lastValueFrom(this.http.get<StudentsSummary>(url, { params }));

        this.queryClient.setQueryData(['paged-students', params], response.pagedStudents);

        return response;
      },
    }));
  }

  getPagedStudentsQuery(
    queryParams: Signal<StudentQueryParams>,
    queryResult: CreateQueryResult<StudentsSummary>,
  ) {
    const url = `${this.apiUrl}/admin/students`;

    return injectQuery<PagedResult<StudentItem>>(() => ({
      queryKey: ['paged-students', queryParams()],
      queryFn: () =>
        lastValueFrom(this.http.get<PagedResult<StudentItem>>(url, { params: queryParams() })),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess(),
    }));
  }

  sendInvitationMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/invite`, null)),
  }));

  activateStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/activate`, null)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['paged-students'], refetchType: 'none' })
      this.queryClient.invalidateQueries({ queryKey: ['students-summary'] })
    }
  }));

  deactivateStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/deactivate`, null)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['paged-students'], refetchType: 'none' })
      this.queryClient.invalidateQueries({ queryKey: ['students-summary'] })
    }
  }));

  deleteStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(this.http.delete<void>(`${this.apiUrl}/admin/students/${studentId}`)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['paged-students'], refetchType: 'none' })
      return this.queryClient.invalidateQueries({ queryKey: ['students-summary'] })
    }
  }));
}
