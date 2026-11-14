import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { CreateInquiryRequest } from '../models/create-inquiry-request';

@Service()
export class InquiryService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  sendInquiryMutation = injectMutation(() => ({
    mutationFn: (request: CreateInquiryRequest) =>
      lastValueFrom(this.http.post(`${this.apiUrl}/inquiries`, request)),
  }));
}
