export const inquiryKeys = {
  all: ['inquiries'] as const,
  summary: () => [...inquiryKeys.all, 'summary'] as const,
  pages: () => [...inquiryKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) => [...inquiryKeys.pages(), params] as const,
};
