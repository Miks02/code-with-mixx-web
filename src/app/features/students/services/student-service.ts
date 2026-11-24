import { inject, Service, Signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  CreateQueryResult,
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { analyticsKeys } from '@features/analytics';
import { StudentQueryParams } from '../models/student-query-params';
import { StudentsSummary } from '../models/students-summary';
import { PagedResult } from '@core/models/paged-result';
import { StudentItem } from '../models/student-item';
import { ProblemDetails } from '@core/models/problem-details';
import { CreateStudentFormModel, CreateStudentRequest } from '../models/create-student-request';
import {
  UpdateStudentFormModel,
  UpdateStudentRequest,
  UpdateStudentResponse,
} from '../models/update-student-request';
import { StudentLookup } from '../models/student-lookup';
import { studentKeys } from '../utilities/student-keys';
import { StudentDetailsQueryParams, StudentDetailsResponse } from '../models/student-details';

@Service()
export class StudentService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getStudentsSummaryQuery(queryParams: Signal<StudentQueryParams>) {
    const url = `${this.apiUrl}/admin/students/summary`;

    return injectQuery<StudentsSummary>(() => ({
      queryKey: studentKeys.summary(),
      queryFn: async () => {
        const params = queryParams();
        const response = await lastValueFrom(this.http.get<StudentsSummary>(url, { params }));

        this.queryClient.setQueryData(studentKeys.page(params), response.pagedStudents);

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
      queryKey: studentKeys.page(queryParams()),
      queryFn: () =>
        lastValueFrom(this.http.get<PagedResult<StudentItem>>(url, { params: queryParams() })),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess() && !queryResult.isFetching(),
    }));
  }

  getStudentDetailsQuery(
    studentId: Signal<string>,
    queryParams: Signal<StudentDetailsQueryParams>,
  ) {
    return injectQuery<StudentDetailsResponse>(() => {
      const { reservationType, ...paging } = queryParams();
      const params = reservationType ? { ...paging, reservationType } : paging;

      return {
        queryKey: studentKeys.detail(studentId(), queryParams()),
        queryFn: () =>
          lastValueFrom(
            this.http.get<StudentDetailsResponse>(`${this.apiUrl}/admin/students/${studentId()}`, {
              params,
            }),
          ),
        // Keep the previous page while paging, but never show another student's data.
        placeholderData: (previous, previousQuery) =>
          previousQuery?.queryKey[2] === studentId() ? keepPreviousData(previous) : undefined,
        // Reservations change from other pages (payments, statuses), so always refetch on visit.
        staleTime: 0,
        enabled: !!studentId(),
      };
    });
  }

  getStudentsLookupQuery() {
    return injectQuery<StudentLookup[]>(() => ({
      queryKey: studentKeys.lookup(),
      queryFn: () =>
        lastValueFrom(this.http.get<StudentLookup[]>(`${this.apiUrl}/admin/students/lookup`, {})),
    }));
  }

  createStudentMutation = injectMutation<void, ProblemDetails, CreateStudentFormModel>(() => ({
    mutationFn: (model: CreateStudentFormModel) => {
      const request: CreateStudentRequest = {
        ...model,
        university: model.university.trim() || null,
      };

      return lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/students`, request));
    },
    onSuccess: () => this.invalidateQueries(),
  }));

  searchStudentsQuery(searchTerm: Signal<string>) {
    return injectQuery(() => ({
      queryKey: studentKeys.search(searchTerm()),
      queryFn: () => lastValueFrom(this.http.get(`${this.apiUrl}/admin/students/search`)),
    }));
  }

  updateStudentMutation = injectMutation<
    UpdateStudentResponse,
    ProblemDetails,
    UpdateStudentFormModel
  >(() => ({
    mutationFn: (model: UpdateStudentFormModel) => {
      const request: UpdateStudentRequest = {
        ...model,
        university: model.university.trim() || null,
      };

      return lastValueFrom(
        this.http.put<UpdateStudentResponse>(`${this.apiUrl}/admin/students/${model.id}`, request),
      );
    },
    onSuccess: () => this.invalidateQueries(),
  }));

  sendInvitationMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(
        this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/invite`, null),
      ),
  }));

  activateStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(
        this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/activate`, null),
      ),
    onSuccess: () => {
      this.invalidateQueries();
    },
  }));

  deactivateStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(
        this.http.post<void>(`${this.apiUrl}/admin/students/${studentId}/deactivate`, null),
      ),
    onSuccess: () => {
      this.invalidateQueries();
    },
  }));

  deleteStudentMutation = injectMutation<void, ProblemDetails, string>(() => ({
    mutationFn: (studentId: string) =>
      lastValueFrom(this.http.delete<void>(`${this.apiUrl}/admin/students/${studentId}`)),
    onSuccess: () => this.invalidateQueries(),
  }));

  private invalidateQueries() {
    this.queryClient.invalidateQueries({ queryKey: studentKeys.pages(), refetchType: 'none' });
    this.queryClient.invalidateQueries({ queryKey: analyticsKeys.all(), refetchType: 'none' });
    this.queryClient.invalidateQueries({ queryKey: studentKeys.lookup() });
    return this.queryClient.invalidateQueries({ queryKey: studentKeys.summary() });
  }
}
