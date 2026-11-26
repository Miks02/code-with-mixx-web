import { Component, computed, input } from '@angular/core';
import { dateConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { RecentPayment } from '@features/analytics/student/models/recent-payment';
import { ReservationType } from '@features/reservations';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Panel } from '@shared/components/panel/panel';
import {
  faSolidCalendar,
  faSolidFileContract,
  faSolidReceipt,
  faSolidWallet,
} from '@ng-icons/font-awesome/solid';
import { RouterLink } from '@angular/router';

const PAYMENT_TITLES: Record<ReservationType, string> = {
  [ReservationType.Class]: 'Uplata za paket časova',
  [ReservationType.Project]: 'Uplata za projekat',
};

@Component({
  imports: [NgIcon, Panel, RouterLink],
  providers: [
    provideIcons({ faSolidCalendar, faSolidReceipt, faSolidWallet, faSolidFileContract }),
  ],
  selector: 'app-recent-payments',
  templateUrl: './recent-payments.html',
})
export class RecentPayments {
  payments = input.required<RecentPayment[]>();

  paymentCards = computed(() =>
    this.payments().map((payment) => ({
      ...payment,
      title: PAYMENT_TITLES[payment.reservationType],
      date: dateConverter(payment.transactionDate, { day: '2-digit', month: '2-digit' }),
      amount: `+${priceConverter(payment.amount)}`,
    })),
  );
}
