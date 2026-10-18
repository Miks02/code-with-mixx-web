export const reservationKeys = {
  all: ['reservations'] as const,
};

export const projectReservationKeys = {
  all: [...reservationKeys.all, 'projects'] as const,
  summaries: () => [...projectReservationKeys.all, 'summary'] as const,
  summary: <TParams extends object>(params: TParams) =>
    [...projectReservationKeys.summaries(), params] as const,
  pages: () => [...projectReservationKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) =>
    [...projectReservationKeys.pages(), params] as const,
  details: () => [...projectReservationKeys.all, 'details'] as const,
  detail: (id: number) => [...projectReservationKeys.details(), id] as const,
};
