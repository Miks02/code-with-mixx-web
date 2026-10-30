import { Component, computed, input } from '@angular/core';
import { timeConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { ClassItem } from '@features/classes/models/class-item';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarDays, faSolidCalendarPlus } from '@ng-icons/font-awesome/solid';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';

@Component({
  imports: [NgIcon, SrDatePipe],
  providers: [
    provideIcons({
      faSolidCalendarDays,
      faSolidCalendarPlus,
    }),
  ],
  selector: 'app-class-card',
  styleUrl: './class-card.css',
  templateUrl: './class-card.html',
})
export class ClassCard {
  class = input.required<ClassItem>();

  priceLabel = computed(() => priceConverter(this.class().price));
  startsAtLabel = computed(() => timeConverter(this.class().startsAt));
  endsAtLabel = computed(() => timeConverter(this.class().endsAt));

}
