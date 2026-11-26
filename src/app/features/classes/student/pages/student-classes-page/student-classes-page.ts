import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidCalendarXmark,
  faSolidChalkboardUser,
  faSolidCircleCheck,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';
import { NextClassCard } from '@features/classes/components/next-class-card/next-class-card';
import { StudentClassReservationDetails } from '@features/classes/student/components/student-class-reservation-details/student-class-reservation-details';
import { StudentClassReservationList } from '@features/classes/student/components/student-class-reservation-list/student-class-reservation-list';
import { StudentClassStore } from '@features/classes/student/stores/student-class-store';

@Component({
  imports: [
    StudentClassReservationList,
    StudentClassReservationDetails,
    NextClassCard,
    StatsCard,
    ScrollIntoViewOn,
  ],
  providers: [
    StudentClassStore,
    provideIcons({
      faSolidCalendarCheck,
      faSolidCalendarXmark,
      faSolidChalkboardUser,
      faSolidCircleCheck,
    }),
  ],
  selector: 'app-student-classes-page',
  templateUrl: './student-classes-page.html',
})
export class StudentClassesPage {
  protected store = inject(StudentClassStore);
}
