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

export const classReservationKeys = {
  all: [...reservationKeys.all, 'classes'] as const,
  summary: () => [...classReservationKeys.all, 'summary'] as const,
  pages: () => [...classReservationKeys.all, 'page'] as const,
  page: <TParams extends object>(params: TParams) =>
    [...classReservationKeys.pages(), params] as const,
  details: () => [...classReservationKeys.all, 'details'] as const,
  detail: (id: number) => [...classReservationKeys.details(), id] as const,
  items: () => [...classReservationKeys.all, 'items'] as const,
  item: (id: number) => [...classReservationKeys.items(), id] as const,
};
