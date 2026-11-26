import { PaymentTransactionsSortBy } from './payment-transactions-sort-by';
import { PaymentType } from './payment-type';

export type PaymentQueryParams = {
  pageNumber: number;
  pageSize: number;
  paymentTypes: PaymentType[];
  sortBy: PaymentTransactionsSortBy;
};
