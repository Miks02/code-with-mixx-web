import { HttpClient } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { environment } from '@environments/environment';
import { AdminQueryParams } from '../models/admin-query-params';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AdminAnalytics } from '../models/admin-analytics';
import { lastValueFrom } from 'rxjs';
import { AnalyticsKeys } from '../utility/analytics-keys';

@Service()
export class AnalyticsService {
  private apiUrl = environment.apiUrl; 

  private http = inject(HttpClient);

  getAdminAnalyticsQuery(queryParams: Signal<AdminQueryParams>) {
    return injectQuery(() => ({
      queryKey: AnalyticsKeys.page(queryParams()),
      queryFn: () => lastValueFrom(this.http.get<AdminAnalytics>(`${this.apiUrl}/admin/analytics`, { params: queryParams() })),
    }))    
  }
  
}
