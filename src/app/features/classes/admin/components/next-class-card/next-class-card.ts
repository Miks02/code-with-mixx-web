import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBuildingColumns,
  faSolidCalendarDay,
  faSolidCalendarXmark,
  faSolidClock,
  faSolidForwardStep,
} from '@ng-icons/font-awesome/solid';
import { dateConverter, timeConverter } from '@core/utilities/date-helpers';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { NextClass } from '@features/classes/models/classes-summary';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Component({
  imports: [NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidBuildingColumns,
      faSolidCalendarDay,
      faSolidCalendarXmark,
      faSolidClock,
      faSolidForwardStep,
    }),
  ],
  selector: 'app-next-class-card',
  styleUrl: './next-class-card.css',
  templateUrl: './next-class-card.html',
})
export class NextClassCard {
  nextClass = input.required<NextClass | null | undefined>();
  isPending = input<boolean>(false);

  studentInitials = computed(
    () =>
      this.nextClass()
        ?.studentFullName.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() ?? '',
  );

  startDate = computed(() => {
    const startsAt = this.nextClass()?.startsAt;
    return startsAt ? dateConverter(startsAt) : '';
  });

  startTime = computed(() => {
    const startsAt = this.nextClass()?.startsAt;
    return startsAt ? timeConverter(startsAt) : '';
  });

  relativeDay = computed(() => {
    const startsAt = this.nextClass()?.startsAt;
    if (!startsAt) return '';

    const start = new Date(startsAt);
    const today = new Date();
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((startDay.getTime() - currentDay.getTime()) / DAY_IN_MS);

    if (days <= 0) return 'Danas';
    if (days === 1) return 'Sutra';
    return `Za ${days} dana`;
  });
}
