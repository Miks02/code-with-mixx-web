export const analyticsKeys = {
  all: () => ['analytics'] as const,
  page: <TParams extends object>(params: TParams | null) => ['analytics', params] as const,
};
