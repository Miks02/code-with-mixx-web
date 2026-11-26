import { PagedResult } from '@core/models/paged-result';
import { PaymentTransactionItem } from './payment-transaction-item';

export type PaymentsSummary = {
  pagedPayments: PagedResult<PaymentTransactionItem>;
  totalTransactions: number;
  paymentsCount: number;
  refundsCount: number;
  reversalsCount: number;
  totalDebt: number;
  debtsCount: number;
};
