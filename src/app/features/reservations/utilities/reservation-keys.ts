export const reservationKeys = {
  all: ['reservations'] as const,
  payments: (reservationId: number) => [...reservationKeys.all, 'payments', reservationId] as const,
  allPayments: () => [...reservationKeys.all, 'payments'] as const,
};

export const projectReservationKeys = {
  all: [...reservationKeys.all, 'projects'] as const,
  summary: () => [...projectReservationKeys.all, 'summary'] as const,
  pages: () => [...projectReservationKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) =>
    [...projectReservationKeys.pages(), params] as const,
  details: () => [...projectReservationKeys.all, 'details'] as const,
  detail: (id: number) => [...projectReservationKeys.details(), id] as const,
  items: () => [...projectReservationKeys.all, 'items'] as const,
  item: (projectId: number) => [...projectReservationKeys.items(), projectId] as const,
};
