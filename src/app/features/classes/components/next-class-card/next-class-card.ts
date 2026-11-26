import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBuildingColumns,
  faSolidCalendar,
  faSolidCalendarDay,
  faSolidCalendarXmark,
  faSolidClock,
  faSolidForwardStep,
} from '@ng-icons/font-awesome/solid';
import { dateConverter, timeConverter } from '@core/utilities/date-helpers';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Panel } from '@shared/components/panel/panel';
import { NextClass } from '@features/classes/models/classes-summary';
import { StudentNextClass } from '@features/classes/student/models/student-class-reservation-item';
import { Badge } from '@shared/components/badge/badge';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Component({
  imports: [Badge, NgIcon, Skeleton, Panel],
  providers: [
    provideIcons({
      faSolidBuildingColumns,
      faSolidCalendar,
      faSolidCalendarDay,
      faSolidCalendarXmark,
      faSolidClock,
      faSolidForwardStep,
    }),
  ],
  selector: 'app-next-class-card',
  templateUrl: './next-class-card.html',
})
export class NextClassCard {
  nextClass = input.required<NextClass | StudentNextClass | null | undefined>();
  isPending = input<boolean>(false);

  studentFullName = computed(() => {
    const nextClass = this.nextClass();
    return nextClass && 'studentFullName' in nextClass ? nextClass.studentFullName : null;
  });

  university = computed(() => {
    const nextClass = this.nextClass();
    return nextClass && 'university' in nextClass ? nextClass.university : null;
  });

  studentInitials = computed(
    () =>
      this.studentFullName()
        ?.split(' ')
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
