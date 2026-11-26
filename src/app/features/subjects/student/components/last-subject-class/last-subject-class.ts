import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidClockRotateLeft } from '@ng-icons/font-awesome/solid';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { LastSubjectClass as LastSubjectClassItem } from '@features/subjects/student/models/student-subjects-summary';

@Component({
  imports: [NgIcon, Skeleton],
  providers: [provideIcons({ faSolidCalendar, faSolidClockRotateLeft })],
  selector: 'app-last-subject-class',
  templateUrl: './last-subject-class.html',
  host: { class: 'flex-1' },
})
export class LastSubjectClass {
  lastClass = input<LastSubjectClassItem>();
  isPending = input<boolean>(false);

  classDate = computed(() => {
    const date = this.lastClass()?.classDate;
    if (!date) return undefined;

    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('sr-Latn-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}
