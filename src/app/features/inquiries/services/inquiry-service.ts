import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { environment } from '@environments/environment';
import {
  CreateQueryResult,
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { PagedResult } from '@core/models/paged-result';
import { CreateInquiryRequest } from '../models/create-inquiry-request';
import { DeleteInquiriesResponse } from '../models/delete-inquiries-response';
import { InquiriesSummary } from '../models/inquiries-summary';
import { InquiryItem } from '../models/inquiry-item';
import { InquiryQueryParams } from '../models/inquiry-query-params';
import { inquiryKeys } from '../utilities/inquiry-keys';

@Service()
export class InquiryService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);

  getInquiriesSummaryQuery(queryParams: Signal<InquiryQueryParams>) {
    const url = `${this.apiUrl}/admin/inquiries/summary`;

    return injectQuery<InquiriesSummary>(() => ({
      queryKey: inquiryKeys.summary(),
      queryFn: async () => {
        const response = await lastValueFrom(
          this.http.get<InquiriesSummary>(url, { params: queryParams() }),
        );

        this.queryClient.setQueryData(inquiryKeys.page(queryParams()), response.pagedInquiries);
        return response;
      },
    }));
  }

  getPagedInquiriesQuery(
    queryParams: Signal<InquiryQueryParams>,
    queryResult: CreateQueryResult<InquiriesSummary>,
  ) {
    const url = `${this.apiUrl}/admin/inquiries`;

    return injectQuery<PagedResult<InquiryItem>>(() => ({
      queryKey: inquiryKeys.page(queryParams()),
      queryFn: () =>
        lastValueFrom(this.http.get<PagedResult<InquiryItem>>(url, { params: queryParams() })),
      placeholderData: keepPreviousData,
      enabled: queryResult.isSuccess() && !queryResult.isFetching(),
    }));
  }

  sendInquiryMutation = injectMutation(() => ({
    mutationFn: (request: CreateInquiryRequest) =>
      lastValueFrom(this.http.post(`${this.apiUrl}/inquiries`, request)),
  }));

  resolveInquiryMutation = injectMutation(() => ({
    mutationFn: (inquiryId: number) =>
      lastValueFrom(
        this.http.post<InquiryItem>(`${this.apiUrl}/admin/inquiries/${inquiryId}/resolve`, {}),
      ),
    onSuccess: () => this.invalidateQueries(),
  }));

  deleteInquiryMutation = injectMutation(() => ({
    mutationFn: (inquiryId: number) =>
      lastValueFrom(this.http.delete(`${this.apiUrl}/admin/inquiries/${inquiryId}`)),
    onSuccess: () => this.invalidateQueries(),
  }));

  deleteInquiriesMutation = injectMutation(() => ({
    mutationFn: (inquiryIds: number[]) =>
      lastValueFrom(
        this.http.delete<DeleteInquiriesResponse>(`${this.apiUrl}/admin/inquiries`, {
          params: { inquiryIds },
        }),
      ),
    onSuccess: () => this.invalidateQueries(),
  }));

  private invalidateQueries() {
    this.queryClient.invalidateQueries({ queryKey: inquiryKeys.pages(), refetchType: 'none' });
    return this.queryClient.invalidateQueries({ queryKey: inquiryKeys.summary() });
  }
}
