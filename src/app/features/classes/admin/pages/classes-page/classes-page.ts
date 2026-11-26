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
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';

@Component({
  imports: [
    ClassReservationsList,
    ClassReservationDetails,
    NextClassCard,
    StatsCard,
    ScrollIntoViewOn,
  ],
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
  templateUrl: './classes-page.html',
})
export class ClassesPage {
  protected store = inject(AdminClassStore);
}
