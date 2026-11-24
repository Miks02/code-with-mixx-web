export type ClassReservationItem = {
  reservationId: number;
  scheduledClassesCount: number;
  completedClassesCount: number;
};

export type ClassReservationsSummary = {
  total: number;
  totalHours: number;
  classReservationItems: ClassReservationItem[];
};
