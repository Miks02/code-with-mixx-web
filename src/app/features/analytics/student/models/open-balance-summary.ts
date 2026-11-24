export type OpenBalanceItem = {
  reservationId: number;
  transactionId: number;
  amount: number;
  transactionDate: string;
};

export type OpenBalanceSummary = {
  remainingDebt: number;
  overdueReservationsCount: number;
  openBalanceItems: OpenBalanceItem[];
};
