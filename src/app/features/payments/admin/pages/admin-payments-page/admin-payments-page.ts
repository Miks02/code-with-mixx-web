import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCirclePlus,
  faSolidHandHoldingDollar,
  faSolidReceipt,
  faSolidRotateLeft,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';
import { AdminPaymentsList } from '@features/payments/admin/components/admin-payments-list/admin-payments-list';
import { AdminPaymentsStore } from '@features/payments/admin/stores/admin-payments-store';
import { OpenBalance } from '@features/payments/components/open-balance/open-balance';
import { StatsCard } from '@shared/components/stats-card/stats-card';

@Component({
  imports: [AdminPaymentsList, OpenBalance, StatsCard],
  providers: [
    AdminPaymentsStore,
    provideIcons({
      faSolidCirclePlus,
      faSolidHandHoldingDollar,
      faSolidReceipt,
      faSolidRotateLeft,
      faSolidTriangleExclamation,
    }),
  ],
  selector: 'app-admin-payments-page',
  templateUrl: './admin-payments-page.html',
})
export class AdminPaymentsPage {
  protected store = inject(AdminPaymentsStore);
}
