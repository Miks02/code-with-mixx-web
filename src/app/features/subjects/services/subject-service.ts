import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import {
  CreateQueryResult,
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../core/models/paged-result';
import { ProblemDetails } from '../../../core/models/problem-details';
import { CreateSubjectRequest } from '../models/create-subject-request';
import { SubjectItem } from '../models/subject-item';
import { SubjectsSummary } from '../models/subjects-summary';
import { UpdateSubjectRequest } from '../models/update-subject-request';
import { dateConverter } from '../../../core/utilities/date-helpers';
import { SubjectSort } from '../models/subject-sort';

@Service()
export class SubjectService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getSubjectsSummaryForAdminQuery(
    pageNumber: Signal<number>,
    pageSize: Signal<number>,
    searchTerm: Signal<string>,
    sortBy: Signal<SubjectSort>,
    onlyDeleted: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: ['subjects-summary-admin'],
      queryFn: () =>
        lastValueFrom(
          this.http.get<SubjectsSummary>(`${this.apiUrl}/admin/subjects/summary`, {
            params: {
              pageSize: pageSize(),
              pageNumber: pageNumber(),
              searchTerm: searchTerm(),
              sortBy: sortBy(),
              onlyDeleted: onlyDeleted(),
            },
          }),
        ),
      select: (data: SubjectsSummary) => ({
        ...data,
        pagedSubjects: {
          ...data.pagedSubjects,
          items: data.pagedSubjects.items.map((subject) => ({
            ...subject,
            createdAt: dateConverter(subject.createdAt),
          })),
        },
      }),
    }));
  }

  getPagedSubjectsForAdminQuery(
    queryResult: CreateQueryResult<SubjectsSummary>,
    pageNumber: Signal<number>,
    pageSize: Signal<number>,
    searchTerm: Signal<string>,
    sortBy: Signal<SubjectSort>,
    onlyDeleted: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: ['paged-subjects-admin', pageNumber(), pageSize(), searchTerm(), sortBy(), onlyDeleted()],
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<SubjectItem>>(`${this.apiUrl}/admin/subjects`, {
            params: {
              pageSize: pageSize(),
              pageNumber: pageNumber(),
              searchTerm: searchTerm(),
              sortBy: sortBy(),
              onlyDeleted: onlyDeleted(),
            },
          }),
        ),
      select: (data) => ({
        ...data,
        items: data.items.map((subject) => ({
          ...subject,
          createdAt: dateConverter(subject.createdAt),
        })),
      }),
      enabled: queryResult.isSuccess,
      placeholderData: queryResult.data()?.pagedSubjects,
    }));
  }

  createSubjectMutation = injectMutation<
    Pick<SubjectItem, 'id' | 'subjectName' | 'subjectDescription' | 'createdAt'>,
    ProblemDetails,
    CreateSubjectRequest
  >(() => ({
    mutationFn: (request: CreateSubjectRequest) =>
      lastValueFrom(
        this.http.post<
          Pick<SubjectItem, 'id' | 'subjectName' | 'subjectDescription' | 'createdAt'>
        >(`${this.apiUrl}/admin/subjects`, request),
      ),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['subjects-summary-admin'] }),
  }));

  updateSubjectMutation = injectMutation<SubjectItem, ProblemDetails, UpdateSubjectRequest>(() => ({
    mutationFn: (request: UpdateSubjectRequest) =>
      lastValueFrom(
        this.http.put<SubjectItem>(`${this.apiUrl}/admin/subjects/${request.id}`, {
          subjectName: request.subjectName,
          subjectDescription: request.subjectDescription,
        }),
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['subjects-summary-admin'] });
      this.queryClient.invalidateQueries({ queryKey: ['subjects-paged-admin'] });
    },
  }));

  deleteSubjectMutation = injectMutation<void, ProblemDetails, number>(() => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.http.delete<void>(`${this.apiUrl}/admin/subjects/${id}`)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['subjects-summary-admin'] });
      this.queryClient.invalidateQueries({ queryKey: ['paged-subjects-admin'] });
    },
  }));
}
