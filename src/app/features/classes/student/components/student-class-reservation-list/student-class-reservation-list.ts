import { Component, computed, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidChartDiagram,
  faSolidMoneyBillTransfer,
} from '@ng-icons/font-awesome/solid';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { PagedList } from '@shared/components/paged-list/paged-list';
import {
  CONFLICTING_RESERVATION_STATUSES,
  PaymentStatus,
  RESERVATION_STATUS_FILTER_LABELS,
} from '@features/reservations';
import { ClassReservationCard } from '@features/classes/components/class-reservation-card/class-reservation-card';
import { StudentClassStore } from '@features/classes/student/stores/student-class-store';

@Component({
  imports: [ClassReservationCard, FilterContainer, FilterMenu, PagedList],
  providers: [
    provideIcons({
      faSolidBook,
      faSolidChartDiagram,
      faSolidMoneyBillTransfer,
    }),
  ],
  selector: 'app-student-class-reservation-list',
  templateUrl: './student-class-reservation-list.html',
})
export class StudentClassReservationList {
  protected store = inject(StudentClassStore);

  protected conflictingReservationStatuses = CONFLICTING_RESERVATION_STATUSES;

  protected subjectOptions = computed<Record<string, string>>(() =>
    Object.fromEntries(this.store.subjects().map((subject) => [subject.id, subject.subjectName])),
  );
  protected selectedSubjectOptions = computed(() => this.store.params.subjectIds().map(String));

  protected reservationStatuses = RESERVATION_STATUS_FILTER_LABELS;

  protected paymentStatuses: Record<PaymentStatus, string> = {
    [PaymentStatus.Pending]: 'Na čekanju',
    [PaymentStatus.Paid]: 'Plaćeno',
    [PaymentStatus.PartiallyPaid]: 'Delimično plaćeno',
    [PaymentStatus.Overdue]: 'Kasni uplata',
    [PaymentStatus.Refunded]: 'Povraćen novac',
  };

  onSubjectsChanged(subjectIds: string[]) {
    this.store.setSubjectIds(subjectIds.map(Number));
  }
}
