import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidChalkboardUser,
  faSolidDiagramProject,
  faSolidTriangleExclamation,
  faSolidUserXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { StudentProfile } from '@features/students/admin/components/student-profile/student-profile';
import { StudentReservationsList } from '@features/students/admin/components/student-reservations-list/student-reservations-list';
import { AdminStudentDetailsStore } from '@features/students/admin/stores/admin-student-details-store';

@Component({
  imports: [RouterLink, NgIcon, Button, StatsCard, StudentProfile, StudentReservationsList],
  providers: [
    AdminStudentDetailsStore,
    provideIcons({
      faSolidCalendarCheck,
      faSolidChalkboardUser,
      faSolidDiagramProject,
      faSolidTriangleExclamation,
      faSolidUserXmark,
    }),
  ],
  selector: 'app-student-details-page',
  templateUrl: './student-details-page.html',
})
export class StudentDetailsPage {
  protected store = inject(AdminStudentDetailsStore);
}
