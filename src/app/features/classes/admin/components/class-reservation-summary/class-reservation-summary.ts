import { Component, computed, inject, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidCircleCheck, faSolidCircleXmark } from '@ng-icons/font-awesome/solid';
import { timeConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { PAYMENT_STATUS_META, PaymentStatus } from '@features/reservations';
import { SubjectLookupItem } from '@features/subjects';
import { ClassFormService } from '@features/classes/services/class-form-service';

type SummaryStat = {
  label: string;
  value: string;
};

type SummaryCheck = {
  isValid: boolean;
  validLabel: string;
  invalidLabel: string;
};

@Component({
  imports: [Button, NgIcon, FormField, SrDatePipe],
  providers: [provideIcons({ faSolidCheck, faSolidCircleCheck, faSolidCircleXmark })],
  selector: 'app-class-reservation-summary',
  styleUrl: './class-reservation-summary.css',
  templateUrl: './class-reservation-summary.html',
})
export class ClassReservationSummary {
  totalPaid = input<number>(0);
  subjectsLookup = input<SubjectLookupItem[]>();
  submitClicked = output<void>();

  classFormService = inject(ClassFormService);

  reservationModel = this.classFormService.reservationModel;
  reservationForm = this.classFormService.reservationForm;

  priceConverter = priceConverter;
  timeConverter = timeConverter;

  classes = computed(() => this.reservationModel().classes);
  classesSum = computed(() => this.classes().reduce((sum, c) => sum + (c.price || 0), 0));
  totalPrice = computed(() => this.reservationModel().totalPrice ?? this.classesSum());

  private subjectNames = computed(
    () => new Map(this.subjectsLookup()?.map((s) => [s.id, s.subjectName]) ?? []),
  );

  discountRate = computed(() => {
    const classesSum = this.classesSum();
    if (classesSum <= 0 || classesSum < this.totalPrice()) return 0;

    return Math.round(((classesSum - this.totalPrice()) / classesSum) * 10000) / 100;
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

  checks = computed<SummaryCheck[]>(() => [
    {
      isValid: this.reservationForm.studentId().valid(),
      validLabel: 'Student je izabran',
      invalidLabel: 'Student nije izabran',
    },
    {
      isValid: this.classes().length > 0,
      validLabel: 'Rezervacija ima bar jedan čas',
      invalidLabel: 'Rezervacija nema nijedan čas',
    },
    {
      isValid: this.reservationForm.classes().valid(),
      validLabel: 'Polja svih časova su ispravna',
      invalidLabel: 'Neka polja časova nisu ispravna',
    },
    {
      isValid: this.classes().every((c) => c.subjectId !== 0),
      validLabel: 'Svi časovi imaju izabrani predmet.',
      invalidLabel: 'Svi časovi moraju imati izabrani predmet.',
    },
  ]);

  subjectName(subjectId: number) {
    return this.subjectNames().get(subjectId);
  }

  onSubmitClicked() {
    this.submitClicked.emit();
  }

  resetForm() {
    this.classFormService.reset();
  }
}
