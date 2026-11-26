import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBookOpen,
  faSolidBookSkull,
  faSolidCalendar,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';
import { MostPopularSubject } from '@features/subjects/components/most-popular-subject/most-popular-subject';
import { LastSubjectClass } from '@features/subjects/student/components/last-subject-class/last-subject-class';
import { StudentSubjectDetails } from '@features/subjects/student/components/student-subject-details/student-subject-details';
import { StudentSubjectList } from '@features/subjects/student/components/student-subject-list/student-subject-list';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';

@Component({
  imports: [
    StudentSubjectList,
    StudentSubjectDetails,
    MostPopularSubject,
    LastSubjectClass,
    StatsCard,
    ScrollIntoViewOn,
  ],
  providers: [
    StudentSubjectStore,
    provideIcons({ faSolidCalendar, faSolidBook, faSolidBookSkull, faSolidBookOpen }),
  ],
  selector: 'app-student-subject-page',
  templateUrl: './student-subject-page.html',
})
export class StudentSubjectPage {
  protected store = inject(StudentSubjectStore);
}
