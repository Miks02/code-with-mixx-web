import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidHandPointer } from '@ng-icons/font-awesome/solid';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Panel } from '@shared/components/panel/panel';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';

type SubjectStat = {
  icon: string;
  value: number;
  label: string;
};

@Component({
  imports: [NgIcon, Panel, EmptyState],
  providers: [provideIcons({ faSolidCalendar, faSolidHandPointer })],
  selector: 'app-student-subject-details',
  styleUrl: './student-subject-details.css',
  templateUrl: './student-subject-details.html',
})
export class StudentSubjectDetails {
  private store = inject(StudentSubjectStore);

  subject = this.store.selectedSubject;

  stats = computed<SubjectStat[]>(() => {
    const subject = this.subject();
    if (!subject) return [];

    return [{ icon: 'faSolidCalendar', value: subject.classesCount, label: 'Časovi' }];
  });
}
