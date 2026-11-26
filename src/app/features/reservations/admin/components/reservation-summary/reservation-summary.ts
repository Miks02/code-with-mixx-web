import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidCircleCheck, faSolidCircleXmark } from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { PaymentStatus } from '@features/reservations/models/payment-status';
import { ReservationCheck } from '@features/reservations/models/reservation-check';
import { PAYMENT_STATUS_META } from '@features/reservations/utilities/reservation-labels';
import { Badge } from '@shared/components/badge/badge';

type SummaryStat = {
  label: string;
  value: string;
};

@Component({
  imports: [Badge, Button, NgIcon, FormField, Panel],
  providers: [provideIcons({ faSolidCheck, faSolidCircleCheck, faSolidCircleXmark })],
  selector: 'app-reservation-summary',
  templateUrl: './reservation-summary.html',
})
export class ReservationSummary {
  totalPrice = input.required<number>();
  itemsTotal = input.required<number>();
  totalPaid = input(0);
  reservedAt = input.required<FieldTree<string>>();
  description = input.required<FieldTree<string>>();
  checks = input.required<ReservationCheck[]>();
  canSave = input(true);
  isSaving = input(false);

  saved = output<void>();
  formReset = output<void>();

  discountRate = computed(() => {
    const itemsTotal = this.itemsTotal();
    if (itemsTotal <= 0 || itemsTotal < this.totalPrice()) return 0;

    return Math.round(((itemsTotal - this.totalPrice()) / itemsTotal) * 10000) / 100;
  });

  bonus = computed(() => Math.max(0, this.totalPaid() - this.totalPrice()));

  paymentStatus = computed(() => {
    if (this.totalPaid() <= 0) return PAYMENT_STATUS_META[PaymentStatus.Pending];
    if (this.totalPaid() < this.totalPrice())
      return PAYMENT_STATUS_META[PaymentStatus.PartiallyPaid];

    return PAYMENT_STATUS_META[PaymentStatus.Paid];
  });

  stats = computed<SummaryStat[]>(() => {
    let stats: SummaryStat[] = [
      { label: 'Ukupna cena', value: priceConverter(this.totalPrice()) },
      { label: 'Plaćeno', value: priceConverter(this.totalPaid()) },
      {
        label: 'Preostalo',
        value: priceConverter(Math.max(0, this.totalPrice() - this.totalPaid())),
      },
    ];

    if (this.discountRate() > 0) {
      stats.push({ label: 'Popust', value: `${this.discountRate()}%` });
    }
    if (this.bonus() > 0) {
      stats.push({ label: 'Bonus', value: priceConverter(this.bonus()) });
    }
    if (this.totalPrice() === 0) {
      stats = stats.filter((s) => s.label !== 'Ukupna cena');
      stats.push({ label: 'Ukupna cena', value: 'Besplatno' });
    }
    if (this.totalPaid() === 0) {
      stats = stats.filter((s) => s.label !== 'Plaćeno');
    }
    if (this.totalPaid() >= this.totalPrice()) {
      stats = stats.filter((s) => s.label !== 'Preostalo');
    }

    return stats;
  });
}
