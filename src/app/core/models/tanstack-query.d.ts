import type { ProblemDetails } from "./problem-details";

declare module '@tanstack/angular-query-experimental' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    defaultError: ProblemDetails
  }
}