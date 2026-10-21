import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarDays,
  faSolidCirclePlus,
  faSolidMoneyBillWave,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '../../../../../core/services/toast-service';
import { priceConverter } from '../../../../../core/utilities/price-helpers';
import { Button } from '../../../../../shared/button/button';
import { createRegisterPaymentForm } from '../../../factories/reservation-factories';
import { PaymentFormModel } from '../../../models/payment-request';
import { ReservationService } from '../../../services/reservation-service';
import { dateTimeInputValue } from '../../../../../core/utilities/date-helpers';

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
      faSolidCalendarDays,
      faSolidCirclePlus,
      faSolidMoneyBillWave,
      faSolidXmark,
    }),
  ],
  selector: 'app-register-payment-modal',
  styleUrl: './register-payment-modal.css',
  templateUrl: './register-payment-modal.html',
})
export class RegisterPaymentModal {
  private reservationService = inject(ReservationService);
  private toastService = inject(ToastService);

  reservationId = input.required<number>();
  totalPrice = input.required<number>();
  paidAmount = input.required<number>();
  closed = output<void>();

  remainingAmount = computed(() => Math.max(0, this.totalPrice() - this.paidAmount()));

  paymentModel = signal<PaymentFormModel>({
    amount: 0,
    transactionDate: dateTimeInputValue(),
  });
  paymentForm = createRegisterPaymentForm(this.paymentModel);
  registerPaymentMutation = this.reservationService.registerPaymentMutation;

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

  remainingAfterPayment = computed(() =>
    Math.max(0, this.remainingAmount() - this.paymentModel().amount),
  );
  totalPaid = computed(() => this.paidAmount() + this.paymentModel().amount)

  fillRemaining() {
    this.paymentModel.update((model) => ({ ...model, amount: this.remainingAmount() }));
    this.paymentForm.amount().markAsTouched();
  }

  fillTransactionDate() {
    this.paymentModel.update((model) => ({ ...model, transactionDate: dateTimeInputValue() }));
    this.paymentForm.transactionDate().markAsTouched();
  }

  onClose() {
    this.closed.emit();
  }

  currentBonus = computed(() => Math.max(0, this.paidAmount() - this.totalPrice()));
  extraBonus = computed(() => Math.max(0, this.totalPaid() - this.totalPrice() - this.currentBonus()));

  onSubmit() {
    return submit(this.paymentForm, async () => {
      try {
        await this.registerPaymentMutation.mutateAsync({
          reservationId: this.reservationId(),
          amount: this.paymentModel().amount,
          transactionDate: new Date(this.paymentModel().transactionDate).toISOString(),
        });
        this.toastService.showSuccess(
          `Uplata od ${priceConverter(this.paymentModel().amount)} je uspešno registrovana.`,
        );
        this.closed.emit();

        return [];
      } catch {
        this.toastService.showError(
          'Došlo je do greške prilikom registracije uplate. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
