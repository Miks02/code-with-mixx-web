export const studentKeys = {
  all: ['students'] as const,
  summaries: () => [...studentKeys.all, 'summary'] as const,
  summary: <TParams extends object>(params: TParams) =>
    [...studentKeys.summaries(), params] as const,
  pages: () => [...studentKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) => [...studentKeys.pages(), params] as const,
  details: () => [...studentKeys.all, 'details'] as const,
  detail: <TParams extends object>(id: string, params: TParams) =>
    [...studentKeys.details(), id, params] as const,
  lookup: () => [...studentKeys.all, 'lookup'] as const,
  search: (searchTerm: string) => [...studentKeys.all, 'search', searchTerm] as const,
};
