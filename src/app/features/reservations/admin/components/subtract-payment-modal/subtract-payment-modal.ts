import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleMinus,
  faSolidMoneyBillWave,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '../../../../../core/services/toast-service';
import { priceConverter } from '../../../../../core/utilities/price-helpers';
import { Button } from '../../../../../shared/button/button';
import { createSubtractPaymentForm } from '../../../factories/reservation-factories';
import { PaymentFormModel } from '../../../models/payment-request';
import { ReservationService } from '../../../services/reservation-service';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
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
  private reservationService = inject(ReservationService);
  private toastService = inject(ToastService);

  reservationId = input.required<number>();
  totalPrice = input.required<number>();
  paidAmount = input.required<number>();
  closed = output<void>();

  remainingAmount = computed(() => Math.max(0, this.totalPrice() - this.paidAmount()));

  paymentModel = signal<PaymentFormModel>({ amount: 0 });
  paymentForm = createSubtractPaymentForm(this.paymentModel, this.paidAmount);
  subtractPaymentMutation = this.reservationService.subtractPaymentMutation;

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
  remainingAfterSubtract = computed(() => Math.max(0, this.totalPrice() - this.paidAfterSubtract()));

  currentBonus = computed(() => Math.max(0, this.paidAmount() - this.totalPrice()));
  bonusAfterSubtract = computed(() => Math.max(0, this.paidAfterSubtract() - this.totalPrice()));

  fillPaidAmount() {
    this.paymentModel.set({ amount: this.paidAmount() });
    this.paymentForm.amount().markAsTouched();
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
