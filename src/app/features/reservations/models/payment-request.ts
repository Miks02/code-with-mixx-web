export type PaymentRequest = {
  reservationId: number,
  amount: number
}

export type PaymentFormModel = Omit<PaymentRequest, 'reservationId'>;
