import { ProblemDetails } from '@core/models/problem-details';

export const isProblemDetails = (error: unknown): error is ProblemDetails => {
  return typeof error === 'object' && error !== null && 'errorCode' in error && 'status' in error;
};

export const getErrorCode = (error: unknown): string | undefined =>
  isProblemDetails(error) ? error.errorCode : undefined;
