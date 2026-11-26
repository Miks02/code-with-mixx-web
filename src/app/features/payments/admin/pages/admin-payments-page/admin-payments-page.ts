import { Component } from '@angular/core';
import { AdminPaymentsList } from '@features/payments/admin/components/admin-payments-list/admin-payments-list';
import { AdminPaymentsStore } from '@features/payments/admin/stores/admin-payments-store';

@Component({
  imports: [AdminPaymentsList],
  providers: [AdminPaymentsStore],
  selector: 'app-admin-payments-page',
  templateUrl: './admin-payments-page.html',
})
export class AdminPaymentsPage {}
