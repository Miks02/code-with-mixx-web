import { HttpInterceptorFn } from '@angular/common/http';

export const timeZoneInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({
    setHeaders: {
      TimeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }));
};
