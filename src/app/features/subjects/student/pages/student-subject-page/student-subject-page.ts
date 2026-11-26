import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidUserGraduate } from '@ng-icons/font-awesome/solid';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';
import { StudentSubjectDetails } from '@features/subjects/student/components/student-subject-details/student-subject-details';
import { StudentSubjectList } from '@features/subjects/student/components/student-subject-list/student-subject-list';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';

@Component({
  imports: [StudentSubjectList, StudentSubjectDetails, ScrollIntoViewOn],
  providers: [StudentSubjectStore, provideIcons({ faSolidCalendar, faSolidUserGraduate })],
  selector: 'app-student-subject-page',
  templateUrl: './student-subject-page.html',
})
export class StudentSubjectPage {
  protected store = inject(StudentSubjectStore);
}
