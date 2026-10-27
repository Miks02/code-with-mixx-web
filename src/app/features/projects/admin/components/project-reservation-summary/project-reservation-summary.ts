import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidCircleCheck, faSolidCircleXmark } from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { PaymentStatus } from '@features/reservations';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import {
  PAYMENT_STATUS_META,
  PROJECT_TYPE_LABELS,
} from '@features/projects/utilities/project-labels';
import { FormField } from '@angular/forms/signals';

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
  imports: [Button, NgIcon, FormField],
  providers: [provideIcons({ faSolidCheck, faSolidCircleCheck, faSolidCircleXmark })],
  selector: 'app-project-reservation-summary',
  styleUrl: './project-reservation-summary.css',
  templateUrl: './project-reservation-summary.html',
})
export class ProjectReservationSummary {
  totalPaid = input<number>(0);
  submitClicked = output<void>();

  projectFormService = inject(ProjectFormService);

  reservationModel = this.projectFormService.reservationModel;
  reservationForm = this.projectFormService.reservationForm;

  projectTypeLabels = PROJECT_TYPE_LABELS;
  priceConverter = priceConverter;

  projects = computed(() => this.reservationModel().projects);
  totalPrice = computed(() => this.reservationModel().totalPrice || 0);
  projectsSum = computed(() => this.projects().reduce((sum, project) => sum + project.price, 0));

  discountRate = computed(() => {
    const projectsSum = this.projectsSum();
    if (projectsSum <= 0 || projectsSum < this.totalPrice()) return 0;

    return Math.round(((projectsSum - this.totalPrice()) / projectsSum) * 10000) / 100;
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
      isValid: this.projects().length > 0,
      validLabel: 'Rezervacija ima bar jedan projekat',
      invalidLabel: 'Rezervacija nema nijedan projekat',
    },
    {
      isValid: this.reservationForm.projects().valid(),
      validLabel: 'Polja svih projekata su ispravna',
      invalidLabel: 'Neka polja projekata nisu ispravna',
    },
    {
      isValid: this.projects().filter((p) => p.subjectId === 0).length === 0,
      validLabel: 'Svi projekti imaju izabrani predmet.',
      invalidLabel: 'Svi projekti moraju imati izabrani predmet.',
    },
  ]);

  onSubmitClicked() {
    this.submitClicked.emit();
  }

  resetForm() {
    this.projectFormService.reset();
  }
}
