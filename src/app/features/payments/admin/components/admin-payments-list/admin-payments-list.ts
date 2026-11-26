import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidMoneyBillTransfer } from '@ng-icons/font-awesome/solid';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { PagedList } from '@shared/components/paged-list/paged-list';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { AdminPaymentsStore } from '@features/payments/admin/stores/admin-payments-store';
import { PaymentCard } from '@features/payments/components/payment-card/payment-card';
import {
  PAYMENT_SORT_LABELS,
  PAYMENT_TYPE_LABELS,
} from '@features/payments/utilities/payment-labels';

@Component({
  imports: [FilterContainer, FilterMenu, PagedList, PaymentCard, SortMenu],
  providers: [provideIcons({ faSolidMoneyBillTransfer })],
  selector: 'app-admin-payments-list',
  templateUrl: './admin-payments-list.html',
})
export class AdminPaymentsList {
  protected store = inject(AdminPaymentsStore);

  protected paymentTypes = PAYMENT_TYPE_LABELS;
  protected sortOptions = PAYMENT_SORT_LABELS;
}
