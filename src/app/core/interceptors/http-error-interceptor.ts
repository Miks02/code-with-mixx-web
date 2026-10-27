import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { ProblemDetails } from '@core/models/problem-details';
import { isProblemDetails } from '@core/utilities/problem-details-helpers';
import { environment } from '@environments/environment';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
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

      return throwError(() => problemDetails);
    }),
  );
};
