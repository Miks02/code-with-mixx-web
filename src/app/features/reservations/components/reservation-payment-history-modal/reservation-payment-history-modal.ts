import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleMinus,
  faSolidCirclePlus,
  faSolidClockRotateLeft,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { dateTimeConverter } from '../../../../core/utilities/date-helpers';
import { priceConverter } from '../../../../core/utilities/price-helpers';
import { Button } from '../../../../shared/button/button';
import { PaymentType } from '../../../payments';
import { ReservationPaymentHistory } from '../../models/reservation-payment-history';

type PaymentTypeMeta = {
  label: string;
  icon: string;
  sign: string;
  iconClasses: string;
  amountClasses: string;
};

const PAYMENT_TYPE_META: Record<PaymentType, PaymentTypeMeta> = {
  [PaymentType.payment]: {
    label: 'Registrovana Uplata',
    icon: 'faSolidCirclePlus',
    sign: '+',
    iconClasses: 'bg-emerald-700 text-emerald-100',
    amountClasses: 'text-emerald-700',
  },
  [PaymentType.reversal]: {
    label: 'Poništena uplata',
    icon: 'faSolidCircleMinus',
    sign: '−',
    iconClasses: 'bg-red-700 text-red-100',
    amountClasses: 'text-red-700',
  },
};

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidCircleMinus,
      faSolidCirclePlus,
      faSolidClockRotateLeft,
      faSolidXmark,
    }),
  ],
  selector: 'app-reservation-payment-history-modal',
  styleUrl: './reservation-payment-history-modal.css',
  templateUrl: './reservation-payment-history-modal.html',
})
export class ReservationPaymentHistoryModal {
  paymentHistory = input<ReservationPaymentHistory>();
  isLoading = input.required<boolean>();
  closed = output<void>();

  skeletonRows = [0, 1, 2];

  payments = computed(() =>
    [...(this.paymentHistory()?.payments ?? [])].map((payment) => ({
      ...payment,
      meta: PAYMENT_TYPE_META[payment.paymentType],
      amountLabel: priceConverter(payment.amount),
      dateLabel: dateTimeConverter(payment.transactionDate),
    })),
  );

  summary = computed(() => {
    const bonusAmount = this.paymentHistory()?.bonusAmount ?? 0;
    const remainingAmount = this.paymentHistory()?.remainingAmount ?? 0;
    let labels = [
      { label: 'Trenutni iznos', value: priceConverter(this.paymentHistory()?.totalSum ?? 0) },
      { label: 'Uplaćeno', value: priceConverter(this.paymentHistory()?.paidSum ?? 0) },
      { label: 'Poništeno', value: priceConverter(this.paymentHistory()?.reversedSum ?? 0) },
      { label: 'Preostalo', value: priceConverter(remainingAmount) },
    ];

    if (bonusAmount) labels.push({ label: 'Bakšiš', value: priceConverter(bonusAmount) });

    if (!remainingAmount)
      labels = labels.map((lb) => {
        if (lb.label === 'Preostalo') {
          return {
            ...lb,
            value: 'Isplaćeno u celosti',
          };
        }
        return { ...lb };
      });

    return labels;
  });

  onClose() {
    this.closed.emit();
  }
}
