import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '@core/services/auth-service';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { timeZoneInterceptor } from '@core/interceptors/time-zone-interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => inject(AuthService).checkSession()),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              const errorStatus = error.status;
              if (errorStatus >= 400 && errorStatus < 500 && errorStatus !== 0) return false;
              return failureCount < 3;
            },
          },
        },
      }),
    ),
    provideHttpClient(
      withInterceptors([timeZoneInterceptor, httpErrorInterceptor, authInterceptor]),
    ),
  ],
};
