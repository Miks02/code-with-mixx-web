import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBoxArchive,
  faSolidChartDiagram,
  faSolidLayerGroup,
  faSolidMoneyBillTransfer,
  faSolidPlus,
  faSolidUserSlash,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { PagedList } from '@shared/components/paged-list/paged-list';
import {
  CONFLICTING_RESERVATION_STATUSES,
  PaymentStatus,
  RESERVATION_STATUS_FILTER_LABELS,
} from '@features/reservations';
import { Router } from '@angular/router';
import { ProjectReservationCard } from '@features/projects/components/project-reservation-card/project-reservation-card';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import { PROJECT_TYPE_LABELS } from '@features/projects/utilities/project-labels';

@Component({
  imports: [ProjectReservationCard, Button, FilterContainer, FilterMenu, NgIcon, PagedList],
  providers: [
    provideIcons({
      faSolidBoxArchive,
      faSolidPlus,
      faSolidUserSlash,
      faSolidBook,
      faSolidChartDiagram,
      faSolidMoneyBillTransfer,
      faSolidLayerGroup,
    }),
  ],
  selector: 'app-admin-project-reservation-list',
  templateUrl: './admin-project-reservation-list.html',
})
export class AdminProjectReservationList {
  protected store = inject(AdminProjectStore);
  private router = inject(Router);

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

  onOpenCreationForm() {
    this.router.navigate(['admin/projects/create']);
  }
}
