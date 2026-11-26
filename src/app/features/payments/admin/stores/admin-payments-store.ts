import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { PaymentQueryParams } from '@features/payments/models/payment-query-params';
import { PaymentTransactionsSortBy } from '@features/payments/models/payment-transactions-sort-by';
import { PaymentType } from '@features/payments/models/payment-type';
import { PaymentService } from '@features/payments/services/payment-service';

type AdminPaymentsState = {
  params: PaymentQueryParams;
};

const initialState: AdminPaymentsState = {
  params: {
    pageNumber: 1,
    pageSize: 15,
    paymentTypes: [],
    sortBy: PaymentTransactionsSortBy.TransactionDateDescending,
  },
};

export const AdminPaymentsStore = signalStore(
  withState(initialState),
  withProps((store, paymentService = inject(PaymentService)) => {
    const summaryQuery = paymentService.getPaymentsSummaryQuery(store.params);

    return {
      summaryQuery,
      paymentsQuery: paymentService.getPagedPaymentsQuery(store.params, summaryQuery),
      openBalanceQuery: paymentService.getOpenBalanceQuery(),
    };
  }),
  withComputed((store) => ({
    summary: computed(() => store.summaryQuery.data()),
    summaryPending: computed(() => store.summaryQuery.isPending()),
    payments: computed(() => store.paymentsQuery.data()?.items ?? []),
    paymentsPending: computed(() => store.paymentsQuery.isPending()),
    paymentsFetching: computed(() => store.paymentsQuery.isFetching()),
    openBalance: computed(() => store.openBalanceQuery.data()),
  })),
  withMethods((store) => {
    const patchParams = (params: Partial<PaymentQueryParams>) =>
      patchState(store, { params: { ...store.params(), ...params } });

    return {
      setPaymentTypes(paymentTypes: PaymentType[]) {
        patchParams({ paymentTypes, pageNumber: 1 });
      },
      setSortBy(sortBy: PaymentTransactionsSortBy) {
        patchParams({ sortBy, pageNumber: 1 });
      },
      previousPage() {
        const page = store.paymentsQuery.data();
        if (!page?.hasPreviousPage) return;
        patchParams({ pageNumber: page.pageNumber - 1 });
      },
      nextPage() {
        const page = store.paymentsQuery.data();
        if (!page?.hasNextPage) return;
        patchParams({ pageNumber: page.pageNumber + 1 });
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect(() => {
        const paged = store.paymentsQuery.data();
        if (!paged || paged.items.length > 0 || paged.pageNumber <= 1) return;

        const lastPage = Math.max(1, paged.totalPages);
        untracked(() => patchState(store, { params: { ...store.params(), pageNumber: lastPage } }));
      });
    },
  }),
);
