import { Component, computed, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidFileContract, faSolidWallet } from '@ng-icons/font-awesome/solid';
import { dateConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { PaymentTransactionItem } from '@features/payments/models/payment-transaction-item';
import { PaymentType } from '@features/payments/models/payment-type';
import { PAYMENT_TYPE_LABELS } from '@features/payments/utilities/payment-labels';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidCalendar, faSolidFileContract, faSolidWallet })],
  selector: 'app-payment-card',
  templateUrl: './payment-card.html',
})
export class PaymentCard {
  payment = input.required<PaymentTransactionItem>();
  addOpacity = input(false);
  showReservation = input(true);

  protected isNoteOpen = signal(false);

  protected title = computed(() => PAYMENT_TYPE_LABELS[this.payment().paymentType]);
  protected date = computed(() =>
    dateConverter(this.payment().transactionDate, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );
  protected isPayment = computed(() => this.payment().paymentType === PaymentType.payment);
  protected amount = computed(
    () => `${this.isPayment() ? '+' : '−'}${priceConverter(this.payment().amount)}`,
  );
  protected amountClasses = computed(() =>
    this.isPayment() ? 'text-emerald-300 font-bold shrink-0' : 'text-red-400 font-bold shrink-0',
  );

  protected toggleNote() {
    this.isNoteOpen.update((isOpen) => !isOpen);
  }
}
