import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTanStackQuery(new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: (failureCount, error: any) => {
            const errorStatus = error.status;
            if (errorStatus >= 400 && errorStatus < 500)
              return false;
            return failureCount < 3;
          },
        },
      },
    })),
  ]
};
