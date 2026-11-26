import { Component, computed, input } from '@angular/core';
import { timeConverter } from '@core/utilities/date-helpers';
import { StudentUpcomingClass } from '@features/analytics/student/models/student-upcoming-class';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Panel } from '@shared/components/panel/panel';
import { faSolidCalendarXmark, faSolidClock } from '@ng-icons/font-awesome/solid';
import { DateCard } from '@shared/components/date-card/date-card';

@Component({
  imports: [DateCard, NgIcon, Panel],
  providers: [provideIcons({ faSolidClock, faSolidCalendarXmark })],
  selector: 'app-student-upcoming-classes',
  templateUrl: './student-upcoming-classes.html',
})
export class StudentUpcomingClasses {
  upcomingClasses = input.required<StudentUpcomingClass[] | undefined>();

  date = new Date().toString();
  nextClass = computed(() => this.upcomingClasses()?.at(0));
  timeConverter = timeConverter;

  upcomingClassesAfterNext = computed(() =>
    this.upcomingClasses()?.filter((c) => c !== this.nextClass()),
  );
}
