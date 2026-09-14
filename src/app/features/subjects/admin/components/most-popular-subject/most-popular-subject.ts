import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidFire } from '@ng-icons/font-awesome/solid';
import { SubjectItem } from '../../../models/subject-item';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidCalendar, faSolidFire })],
  selector: 'app-most-popular-subject',
  styleUrl: './most-popular-subject.css',
  templateUrl: './most-popular-subject.html',
})
export class MostPopularSubject {
  subject = input.required<SubjectItem | undefined>();

  subjectName = computed(() => this.subject()?.subjectName);
  classesCount = computed(() => this.subject()?.classesCount);
  studentsCount = computed(() => this.subject()?.studentsCount);
}
