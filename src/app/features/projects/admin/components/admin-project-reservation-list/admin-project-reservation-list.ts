import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBoxArchive,
  faSolidChartDiagram,
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidLayerGroup,
  faSolidMoneyBillTransfer,
  faSolidPlus,
  faSolidUserSlash,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { Skeleton } from '@shared/components/skeleton/skeleton';
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
  imports: [ProjectReservationCard, Button, FilterContainer, FilterMenu, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidBoxArchive,
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidPlus,
      faSolidUserSlash,
      faSolidXmark,
      faSolidBook,
      faSolidChartDiagram,
      faSolidMoneyBillTransfer,
      faSolidLayerGroup,
    }),
  ],
  selector: 'app-admin-project-reservation-list',
  styleUrl: './admin-project-reservation-list.css',
  templateUrl: './admin-project-reservation-list.html',
})
export class AdminProjectReservationList {
  protected store = inject(AdminProjectStore);
  private router = inject(Router);

  protected conflictingReservationStatuses = CONFLICTING_RESERVATION_STATUSES;
  protected skeletonItems = Array.from({ length: 6 });

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
