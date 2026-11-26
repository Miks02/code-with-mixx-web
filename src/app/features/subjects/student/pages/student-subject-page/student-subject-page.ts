import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidCalendar, faSolidUserGraduate } from '@ng-icons/font-awesome/solid';
import { StudentSubjectList } from '@features/subjects/student/components/student-subject-list/student-subject-list';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';

@Component({
  imports: [StudentSubjectList],
  providers: [StudentSubjectStore, provideIcons({ faSolidCalendar, faSolidUserGraduate })],
  selector: 'app-student-subject-page',
  templateUrl: './student-subject-page.html',
})
export class StudentSubjectPage {}
