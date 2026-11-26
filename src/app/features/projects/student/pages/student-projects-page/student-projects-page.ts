import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBarsProgress,
  faSolidCircleCheck,
  faSolidFile,
  faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';
import { StudentProjectReservationDetails } from '@features/projects/student/components/student-project-reservation-details/student-project-reservation-details';
import { StudentProjectReservationList } from '@features/projects/student/components/student-project-reservation-list/student-project-reservation-list';
import { StudentProjectStore } from '@features/projects/student/stores/student-project-store';

@Component({
  imports: [
    StudentProjectReservationList,
    StudentProjectReservationDetails,
    StatsCard,
    ScrollIntoViewOn,
  ],
  providers: [
    StudentProjectStore,
    provideIcons({
      faSolidBarsProgress,
      faSolidCircleCheck,
      faSolidFile,
      faSolidHourglassHalf,
    }),
  ],
  selector: 'app-student-projects-page',
  templateUrl: './student-projects-page.html',
})
export class StudentProjectsPage {
  protected store = inject(StudentProjectStore);
}
