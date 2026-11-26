import { Component, computed, input } from '@angular/core';
import { priceConverter } from '@core/utilities/price-helpers';
import { OpenBalanceSummary } from '@features/analytics/student/models/open-balance-summary';
import { PAYMENT_STATUS_META, ReservationType } from '@features/reservations';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Panel } from '@shared/components/panel/panel';
import {
  faSolidChalkboardUser,
  faSolidCircleCheck,
  faSolidFileLines,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';
import { Badge } from '@shared/components/badge/badge';

const RESERVATION_TYPES: Record<ReservationType, { label: string; icon: string }> = {
  [ReservationType.Class]: { label: 'Paket časova', icon: 'faSolidChalkboardUser' },
  [ReservationType.Project]: { label: 'Projekat', icon: 'faSolidFileLines' },
};

function overdueLabel(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return 'rezervacija kasni sa uplatom';
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return 'rezervacije kasne sa uplatom';
  }
  return 'rezervacija kasni sa uplatom';
}

@Component({
  imports: [Badge, NgIcon, Panel],
  providers: [
    provideIcons({
      faSolidChalkboardUser,
      faSolidCircleCheck,
      faSolidFileLines,
      faSolidTriangleExclamation,
    }),
  ],
  selector: 'app-open-balance',
  templateUrl: './open-balance.html',
})
export class OpenBalance {
  summary = input.required<OpenBalanceSummary | undefined>();

  remainingDebt = computed(() => priceConverter(this.summary()?.remainingDebt ?? 0));
  overdueCount = computed(() => this.summary()?.overdueReservationsCount ?? 0);
  overdueLabel = computed(() => overdueLabel(this.overdueCount()));

  items = computed(() =>
    (this.summary()?.openBalanceItems ?? []).map((item) => ({
      ...item,
      type: RESERVATION_TYPES[item.reservationType],
      status: PAYMENT_STATUS_META[item.paymentStatus],
      totalPrice: priceConverter(item.totalPrice),
      paidAmount: priceConverter(item.paidAmount),
      remainingAmount: priceConverter(item.remainingAmount),
    })),
  );
}
