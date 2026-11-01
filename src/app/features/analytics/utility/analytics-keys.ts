export const analyticsKeys = {
  page: <TParams extends object>(params: TParams) => ['admin-analytics', params] as const,
}