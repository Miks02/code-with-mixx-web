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
import { ProblemDetails } from '../../../core/models/problem-details';
import { CreateSubjectRequest } from '../models/create-subject-request';
import { SubjectItem } from '../models/subject-item';
import { SubjectsSummary } from '../models/subjects-summary';
import { UpdateSubjectRequest } from '../models/update-subject-request';
import { dateConverter } from '../../../core/utilities/date-helpers';
import { SubjectSort } from '../models/subject-sort';
import { Item } from 'three/examples/jsm/inspector/ui/Item.js';

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
    onlyArchived: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: ['subjects-summary-admin'],
      queryFn: async () => {
        const params = {
          pageNumber: pageNumber(),
          pageSize: pageSize(),
          searchTerm: searchTerm(),
          sortBy: sortBy(),
          onlyArchived: onlyArchived(),
        };

        const data = await lastValueFrom(
          this.http.get<SubjectsSummary>(`${this.apiUrl}/admin/subjects/summary`, { params }),
        );

        this.queryClient.setQueryData(
          [
            'paged-subjects-admin',
            pageNumber(),
            pageSize(),
            searchTerm(),
            sortBy(),
            onlyArchived(),
          ],
          data.pagedSubjects,
        );

        return data;
      },
      select: (data: SubjectsSummary) => ({
        ...data,
        pagedSubjects: this.mapPagedSubjects(data.pagedSubjects),
      }),
    }));
  }

  getPagedSubjectsForAdminQuery(
    queryResult: CreateQueryResult<SubjectsSummary>,
    pageNumber: Signal<number>,
    pageSize: Signal<number>,
    searchTerm: Signal<string>,
    sortBy: Signal<SubjectSort>,
    onlyArchived: Signal<boolean>,
  ) {
    return injectQuery(() => ({
      queryKey: [
        'paged-subjects-admin',
        pageNumber(),
        pageSize(),
        searchTerm(),
        sortBy(),
        onlyArchived(),
      ],
      queryFn: () =>
        lastValueFrom(
          this.http.get<PagedResult<SubjectItem>>(`${this.apiUrl}/admin/subjects`, {
            params: {
              pageSize: pageSize(),
              pageNumber: pageNumber(),
              searchTerm: searchTerm(),
              sortBy: sortBy(),
              onlyArchived: onlyArchived(),
            },
          }),
        ),
      select: (data) => this.mapPagedSubjects(data),
      enabled: queryResult.isSuccess(),
      placeholderData: keepPreviousData,
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
    onSuccess: () => this.invalidateSubjectQueries(),
  }));

  updateSubjectMutation = injectMutation<SubjectItem, ProblemDetails, UpdateSubjectRequest>(() => ({
    mutationFn: (request: UpdateSubjectRequest) =>
      lastValueFrom(
        this.http.put<SubjectItem>(`${this.apiUrl}/admin/subjects/${request.id}`, {
          subjectName: request.subjectName,
          subjectDescription: request.subjectDescription,
        }),
      ),
    onSuccess: () => this.invalidateSubjectQueries(),
  }));

  deleteSubjectMutation = injectMutation<void, ProblemDetails, number>(() => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.http.delete<void>(`${this.apiUrl}/admin/subjects/${id}`)),
    onSuccess: () => this.invalidateSubjectQueries(),
  }));

  archiveSubjectMutation = injectMutation<void, ProblemDetails, number>(() => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/subjects/${id}/archive`, {})),
    onSuccess: () => this.invalidateSubjectQueries(),
  }));

  restoreSubjectMutation = injectMutation<void, ProblemDetails, number>(() => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.http.post<void>(`${this.apiUrl}/admin/subjects/${id}/restore`, {})),
    onSuccess: () => this.invalidateSubjectQueries(),
  }));

  private mapPagedSubjects(data: PagedResult<SubjectItem>): PagedResult<SubjectItem> {
    return {
      ...data,
      items: data.items.map((subject) => ({
        ...subject,
        createdAt: dateConverter(subject.createdAt),
      })),
    };
  }

  private invalidateSubjectQueries(): Promise<void> {
    this.queryClient.invalidateQueries({
      queryKey: ['paged-subjects-admin'],
      refetchType: 'none',
    });
    return this.queryClient.invalidateQueries({ queryKey: ['subjects-summary-admin'] });
  }
}
