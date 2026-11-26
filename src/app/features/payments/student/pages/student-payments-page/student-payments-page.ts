import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCirclePlus,
  faSolidHandHoldingDollar,
  faSolidReceipt,
  faSolidRotateLeft,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';
import { StudentPaymentsList } from '@features/payments/student/components/student-payments-list/student-payments-list';
import { StudentPaymentsStore } from '@features/payments/student/stores/student-payments-store';
import { OpenBalance } from '@features/payments/components/open-balance/open-balance';
import { StatsCard } from '@shared/components/stats-card/stats-card';

@Component({
  imports: [StudentPaymentsList, OpenBalance, StatsCard],
  providers: [
    StudentPaymentsStore,
    provideIcons({
      faSolidCirclePlus,
      faSolidHandHoldingDollar,
      faSolidReceipt,
      faSolidRotateLeft,
      faSolidTriangleExclamation,
    }),
  ],
  selector: 'app-student-payments-page',
  templateUrl: './student-payments-page.html',
})
export class StudentPaymentsPage {
  protected store = inject(StudentPaymentsStore);
}
