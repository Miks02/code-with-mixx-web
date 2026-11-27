import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '@core/services/auth-service';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { timeZoneInterceptor } from '@core/interceptors/time-zone-interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error-interceptor';
import { provideClientHydration } from '@angular/platform-browser';
import { SelectivePreloading } from '@core/services/selective-preloading';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Without this a second click on the same nav link (same URL and fragment) is ignored,
      // so it would not scroll back to the section.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withPreloading(SelectivePreloading)
    ),
    provideAppInitializer(() => inject(AuthService).checkSession()),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              const errorStatus = error.status;
              if (errorStatus === 0 || (errorStatus >= 400 && errorStatus < 500)) return false;
              return failureCount < 3;
            },
          },
        },
      }),
    ),
    provideHttpClient(
      withInterceptors([timeZoneInterceptor, httpErrorInterceptor, authInterceptor]),
    ),
    provideClientHydration(),
  ],
};
