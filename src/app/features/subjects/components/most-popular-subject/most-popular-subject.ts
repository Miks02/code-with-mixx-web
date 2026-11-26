import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidFire, faSolidUserGraduate } from '@ng-icons/font-awesome/solid';
import { Skeleton } from '@shared/components/skeleton/skeleton';

@Component({
  imports: [NgIcon, Skeleton],
  providers: [provideIcons({ faSolidCalendar, faSolidFire, faSolidUserGraduate })],
  selector: 'app-most-popular-subject',
  templateUrl: './most-popular-subject.html',
  host: { class: 'flex-1' },
})
export class MostPopularSubject {
  subjectName = input<string>();
  classesCount = input<number>();
  studentsCount = input<number>();
  isPending = input<boolean>(false);
}
