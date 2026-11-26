export const paymentKeys = {
  all: ['payments'] as const,
  summary: () => [...paymentKeys.all, 'summary'] as const,
  pages: () => [...paymentKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) => [...paymentKeys.pages(), params] as const,
};
