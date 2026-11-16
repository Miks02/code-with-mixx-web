import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { ReservationType } from '@features/reservations';
import { AdminStudentDetailsStore } from '@features/students/admin/stores/admin-student-details-store';
import { ReservationTypeFilter } from '@features/students/models/student-details';
import { StudentReservationCard } from '../student-reservation-card/student-reservation-card';

const TYPE_FILTER_OPTIONS: Record<ReservationTypeFilter, string> = {
  All: 'Sve rezervacije',
  [ReservationType.Class]: 'Časovi',
  [ReservationType.Project]: 'Projekti',
};

@Component({
  imports: [NgIcon, Button, Skeleton, SortMenu, StudentReservationCard],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight, faSolidXmark })],
  selector: 'app-student-reservations-list',
  styleUrl: './student-reservations-list.css',
  templateUrl: './student-reservations-list.html',
})
export class StudentReservationsList {
  protected store = inject(AdminStudentDetailsStore);

  protected typeOptions = TYPE_FILTER_OPTIONS;
  protected skeletonItems = Array.from({ length: 4 });
}
