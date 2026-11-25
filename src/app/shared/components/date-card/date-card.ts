import { Component, computed, input } from '@angular/core';

export type DateCardVariant = 'full' | 'compact';

@Component({
  selector: 'app-date-card',
  templateUrl: './date-card.html',
})
export class DateCard {
  date = input.required<string | Date>();
  variant = input<DateCardVariant>('full');
  locale = input<string>('sr-Latn-RS');

  private parsedDate = computed(() => new Date(this.date()));

  isoDate = computed(() => this.parsedDate().toISOString());

  month = computed(() => this.format({ month: 'short' }).replace('.', ''));

  day = computed(() => this.format({ day: 'numeric' }));

  weekday = computed(() => this.format({ weekday: 'long' }));

  shortWeekday = computed(() => {
    const weekday = this.format({ weekday: 'short' }).replace('.', '');
    return weekday.charAt(0).toLocaleUpperCase(this.locale()) + weekday.slice(1);
  });

  shortDate = computed(() => this.format({ day: '2-digit', month: '2-digit' }));

  private format(options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale(), options).format(this.parsedDate());
  }
}
