export type PaymentRequest = {
  reservationId: number,
  amount: number,
  transactionDate: string
}

export type PaymentFormModel = Omit<PaymentRequest, 'reservationId'>;
