import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarDays,
  faSolidCircleMinus,
  faSolidMoneyBillWave,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '@core/services/toast-service';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { createSubtractPaymentForm } from '@features/payments/factories/payment-factories';
import { PaymentFormModel } from '@features/payments/models/payment-request';
import { PaymentService } from '@features/payments/services/payment-service';
import { dateTimeInputValue } from '@core/utilities/date-helpers';
import { PaymentType } from '@features/payments/models/payment-type';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
      faSolidCalendarDays,
      faSolidCircleMinus,
      faSolidMoneyBillWave,
      faSolidXmark,
    }),
  ],
  selector: 'app-subtract-payment-modal',
  styleUrl: './subtract-payment-modal.css',
  templateUrl: './subtract-payment-modal.html',
})
export class SubtractPaymentModal {
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  reservationId = input.required<number>();
  totalPrice = input.required<number>();
  paidAmount = input.required<number>();
  closed = output<void>();

  remainingAmount = computed(() => Math.max(0, this.totalPrice() - this.paidAmount()));

  paymentModel = signal<PaymentFormModel>({
    amount: 0,
    transactionDate: dateTimeInputValue(),
    note: '',
    paymentType: PaymentType.reversal,
  });
  paymentForm = createSubtractPaymentForm(this.paymentModel, this.paidAmount);
  subtractPaymentMutation = this.paymentService.subtractPaymentMutation;

  summary = computed(() => {
    const cards = [
      { label: 'Ukupna cena', value: priceConverter(this.totalPrice()) },
      { label: 'Plaćeno', value: priceConverter(this.paidAmount()) },
      { label: 'Preostalo', value: priceConverter(this.remainingAmount()) },
    ];

    if (this.currentBonus())
      cards.push({ label: 'Bonus', value: priceConverter(this.currentBonus()) });

    return cards;
  });

  exceedsPaidAmount = computed(() => this.paymentModel().amount > this.paidAmount());
  paidAfterSubtract = computed(() => Math.max(0, this.paidAmount() - this.paymentModel().amount));
  remainingAfterSubtract = computed(() =>
    Math.max(0, this.totalPrice() - this.paidAfterSubtract()),
  );

  currentBonus = computed(() => Math.max(0, this.paidAmount() - this.totalPrice()));
  bonusAfterSubtract = computed(() => Math.max(0, this.paidAfterSubtract() - this.totalPrice()));

  fillPaidAmount() {
    this.paymentModel.update((model) => ({ ...model, amount: this.paidAmount() }));
    this.paymentForm.amount().markAsTouched();
  }

  paymentTypeOptions = [
    { label: 'Storniranje', value: PaymentType.reversal },
    { label: 'Povraćaj novca', value: PaymentType.refund },
  ];

  selectPaymentType(paymentType: PaymentType) {
    this.paymentModel.update((model) => ({ ...model, paymentType }));
    this.paymentForm.paymentType().markAsTouched();
  }

  fillTransactionDate() {
    this.paymentModel.update((model) => ({ ...model, transactionDate: dateTimeInputValue() }));
    this.paymentForm.transactionDate().markAsTouched();
  }

  onClose() {
    this.closed.emit();
  }

  onSubmit() {
    return submit(this.paymentForm, async () => {
      try {
        await this.subtractPaymentMutation.mutateAsync({
          reservationId: this.reservationId(),
          amount: this.paymentModel().amount,
          transactionDate: new Date(this.paymentModel().transactionDate).toISOString(),
          note: this.paymentModel().note || null,
          paymentType: this.paymentModel().paymentType,
        });
        this.toastService.showSuccess(
          `Uplata od ${priceConverter(this.paymentModel().amount)} je uspešno skinuta.`,
        );
        this.closed.emit();

        return [];
      } catch {
        this.toastService.showError(
          'Došlo je do greške prilikom skidanja uplate. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
