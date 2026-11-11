export const analyticsKeys = {
  all: () => ['admin-analytics'] as const,
  page: <TParams extends object>(params: TParams) => ['admin-analytics', params] as const,
}