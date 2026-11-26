import { Component, inject } from '@angular/core';
import { AdminPaymentsList } from '@features/payments/admin/components/admin-payments-list/admin-payments-list';
import { AdminPaymentsStore } from '@features/payments/admin/stores/admin-payments-store';
import { OpenBalance } from '@features/payments/components/open-balance/open-balance';

@Component({
  imports: [AdminPaymentsList, OpenBalance],
  providers: [AdminPaymentsStore],
  selector: 'app-admin-payments-page',
  templateUrl: './admin-payments-page.html',
})
export class AdminPaymentsPage {
  protected store = inject(AdminPaymentsStore);
}
