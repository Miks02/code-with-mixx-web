export const AnalyticsKeys = {
  page: <TParams extends object>(params: TParams) => ['admin-analytics', params] as const,
}