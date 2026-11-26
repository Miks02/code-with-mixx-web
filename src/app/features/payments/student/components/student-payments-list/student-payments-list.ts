import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidMoneyBillTransfer } from '@ng-icons/font-awesome/solid';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { PagedList } from '@shared/components/paged-list/paged-list';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { StudentPaymentsStore } from '@features/payments/student/stores/student-payments-store';
import { PaymentCard } from '@features/payments/components/payment-card/payment-card';
import {
  PAYMENT_SORT_LABELS,
  PAYMENT_TYPE_LABELS,
} from '@features/payments/utilities/payment-labels';

@Component({
  imports: [FilterContainer, FilterMenu, PagedList, PaymentCard, SortMenu],
  providers: [provideIcons({ faSolidMoneyBillTransfer })],
  selector: 'app-student-payments-list',
  templateUrl: './student-payments-list.html',
})
export class StudentPaymentsList {
  protected store = inject(StudentPaymentsStore);

  protected paymentTypes = PAYMENT_TYPE_LABELS;
  protected sortOptions = PAYMENT_SORT_LABELS;
}
