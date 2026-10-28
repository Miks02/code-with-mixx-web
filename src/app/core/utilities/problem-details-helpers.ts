import { ProblemDetails } from '@core/models/problem-details';

export const isProblemDetails = (error: unknown): error is ProblemDetails => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'errorCode' in error &&
    typeof error.errorCode === 'string'
  );
};

export const getErrorCode = (error: unknown): string | undefined =>
  isProblemDetails(error) ? error.errorCode : undefined;
