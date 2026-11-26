import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidReceipt } from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { Panel } from '@shared/components/panel/panel';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { PaymentCard } from '@features/payments/components/payment-card/payment-card';
import { ReservationPaymentHistory } from '@features/payments/models/reservation-payment-history';

@Component({
  imports: [NgIcon, Panel, PaymentCard, Skeleton],
  providers: [provideIcons({ faSolidReceipt })],
  selector: 'app-reservation-payments',
  templateUrl: './reservation-payments.html',
})
export class ReservationPayments {
  paymentHistory = input<ReservationPaymentHistory>();
  isPending = input(false);

  protected skeletonRows = [0, 1, 2];

  protected payments = computed(() => this.paymentHistory()?.payments ?? []);
  protected description = computed(() => {
    const reversedSum = this.paymentHistory()?.reversedSum ?? 0;
    return reversedSum > 0 ? `Poništeno ukupno: ${priceConverter(reversedSum)}` : undefined;
  });
}
