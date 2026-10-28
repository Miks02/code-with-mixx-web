import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProblemDetails } from '@core/models/problem-details';
import { ToastService } from '@core/services/toast-service';
import { GLOBAL_ERROR_MESSAGES } from '@core/utilities/http-error-messages';
import { isProblemDetails } from '@core/utilities/problem-details-helpers';
import { environment } from '@environments/environment';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const isProduction = environment.production;

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const problemDetails: ProblemDetails = isProblemDetails(err.error)
        ? err.error
        : {
            type: 'about:blank',
            status: err.status,
            title: 'Network error',
            detail: err.message,
            errorCode: err.status === 0 ? 'Network.Unavailable' : 'Http.Unexpected',
          };

      if (!isProduction) console.error(problemDetails);

      showGlobalError(problemDetails, toastService);

      return throwError(() => problemDetails);
    }),
  );
};

// Shows a toast for generic (non-domain) errors. Domain errors are left to the calling component.
function showGlobalError(problemDetails: ProblemDetails, toastService: ToastService) {
  // 401 is skipped on purpose: it is not an error the user should see. authInterceptor reacts to it
  // by silently rotating tokens and retrying the request, and if that fails, AuthService
  // handles the expired session. Guards also hit /auth/me as a guest and expect a 401 there.
  if (problemDetails.status === 401) return;

  // Validation errors carry per-field messages that the form displays itself inside a component.
  if (problemDetails.errors) return;

  const message = GLOBAL_ERROR_MESSAGES[problemDetails.errorCode];
  if (message) toastService.showError(message);
}
