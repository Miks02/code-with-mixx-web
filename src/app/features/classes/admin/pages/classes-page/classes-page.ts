import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidCalendarXmark,
  faSolidChalkboardUser,
  faSolidCircleCheck,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ClassReservationDetails } from '@features/classes/admin/components/class-reservation-details/class-reservation-details';
import { ClassReservationsList } from '@features/classes/admin/components/class-reservations-list/class-reservations-list';
import { NextClassCard } from '@features/classes/admin/components/next-class-card/next-class-card';
import { AdminClassStore } from '@features/classes/admin/stores/admin-class-store';

@Component({
  imports: [ClassReservationsList, ClassReservationDetails, NextClassCard, StatsCard],
  providers: [
    AdminClassStore,
    provideIcons({
      faSolidCalendarCheck,
      faSolidCalendarXmark,
      faSolidChalkboardUser,
      faSolidCircleCheck,
    }),
  ],
  selector: 'app-classes-page',
  styleUrl: './classes-page.css',
  templateUrl: './classes-page.html',
})
export class ClassesPage {
  protected store = inject(AdminClassStore);
}
