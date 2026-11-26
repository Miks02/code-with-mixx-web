import { Component, computed, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidChartDiagram,
  faSolidLayerGroup,
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
import { ProjectReservationCard } from '@features/projects/components/project-reservation-card/project-reservation-card';
import { StudentProjectStore } from '@features/projects/student/stores/student-project-store';
import { PROJECT_TYPE_LABELS } from '@features/projects/utilities/project-labels';

@Component({
  imports: [ProjectReservationCard, FilterContainer, FilterMenu, PagedList],
  providers: [
    provideIcons({
      faSolidBook,
      faSolidChartDiagram,
      faSolidLayerGroup,
      faSolidMoneyBillTransfer,
    }),
  ],
  selector: 'app-student-project-reservation-list',
  templateUrl: './student-project-reservation-list.html',
})
export class StudentProjectReservationList {
  protected store = inject(StudentProjectStore);

  protected conflictingReservationStatuses = CONFLICTING_RESERVATION_STATUSES;

  protected subjectOptions = computed<Record<string, string>>(() =>
    Object.fromEntries(this.store.subjects().map((subject) => [subject.id, subject.subjectName])),
  );
  protected selectedSubjectOptions = computed(() => this.store.params.subjectIds().map(String));

  protected projectTypes = PROJECT_TYPE_LABELS;

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
