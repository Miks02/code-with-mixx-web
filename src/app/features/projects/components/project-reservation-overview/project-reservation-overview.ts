import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBoxArchive,
  faSolidBuildingColumns,
  faSolidCalendarPlus,
  faSolidClockRotateLeft,
  faSolidEnvelope,
  faSolidFileSignature,
} from '@ng-icons/font-awesome/solid';
import { dateConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { PAYMENT_STATUS_META, RESERVATION_STATUS_META } from '@features/reservations';
import { Badge } from '@shared/components/badge/badge';
import { Panel } from '@shared/components/panel/panel';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { ProjectReservationDetails } from '@features/projects/models/project-reservation-details';
import { StudentProjectReservationDetails } from '@features/projects/student/models/student-project-reservation-details';

type InfoRow = { icon: string; label: string; value: string };
type Person = { role: string; fullName: string; email: string; university: string | null };
type FinanceRow = { label: string; value: string };

@Component({
  imports: [Badge, NgIcon, Panel, Skeleton],
  providers: [
    provideIcons({
      faSolidBoxArchive,
      faSolidBuildingColumns,
      faSolidCalendarPlus,
      faSolidClockRotateLeft,
      faSolidEnvelope,
      faSolidFileSignature,
    }),
  ],
  selector: 'app-project-reservation-overview',
  templateUrl: './project-reservation-overview.html',
})
export class ProjectReservationOverview {
  reservationId = input.required<number>();
  details = input<ProjectReservationDetails | StudentProjectReservationDetails>();
  isPending = input(false);

  protected skeletonRows = [0, 1, 2, 3];

  protected title = computed(() => `Rezervacija #${this.reservationId()}`);

  protected reservationStatus = computed(() => {
    const details = this.details();
    return details ? RESERVATION_STATUS_META[details.reservationStatus] : undefined;
  });

  protected paymentStatus = computed(() => {
    const details = this.details();
    return details ? PAYMENT_STATUS_META[details.paymentStatus] : undefined;
  });

  protected person = computed<Person | null>(() => {
    const details = this.details();
    if (!details) return null;
    if ('studentFullName' in details) {
      return {
        role: 'Student',
        fullName: details.studentFullName,
        email: details.studentEmail,
        university: details.studentUniversity,
      };
    }
    return {
      role: 'Instruktor',
      fullName: details.adminFullName,
      email: details.adminEmail,
      university: null,
    };
  });

  protected initials = computed(() =>
    (this.person()?.fullName ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );

  protected infoRows = computed<InfoRow[]>(() => {
    const details = this.details();
    if (!details) return [];

    const person = this.person();
    const rows: InfoRow[] = [];
    if (person) {
      rows.push({ icon: 'faSolidEnvelope', label: 'Email', value: person.email });
    }
    if (person?.university) {
      rows.push({
        icon: 'faSolidBuildingColumns',
        label: 'Univerzitet',
        value: person.university,
      });
    }
    rows.push(
      {
        icon: 'faSolidFileSignature',
        label: 'Rezervisano',
        value: dateConverter(details.reservedAt),
      },
      { icon: 'faSolidCalendarPlus', label: 'Kreirano', value: dateConverter(details.createdAt) },
    );
    if (details.updatedAt) {
      rows.push({
        icon: 'faSolidClockRotateLeft',
        label: 'Poslednja izmena',
        value: dateConverter(details.updatedAt),
      });
    }
    if ('deletedAt' in details && details.deletedAt) {
      rows.push({
        icon: 'faSolidBoxArchive',
        label: 'Arhivirano',
        value: dateConverter(details.deletedAt),
      });
    }
    return rows;
  });

  protected financeRows = computed<FinanceRow[]>(() => {
    const details = this.details();
    if (!details) return [];

    const rows: FinanceRow[] = [
      { label: 'Ukupna cena', value: priceConverter(details.totalPrice) },
    ];
    if (details.discountRate > 0) {
      rows.push({ label: 'Popust', value: `${details.discountRate}%` });
    }
    if (details.bonus > 0) {
      rows.push({ label: 'Bakšiš', value: priceConverter(details.bonus) });
    }
    rows.push({ label: 'Plaćeno', value: priceConverter(details.paidAmount) });
    return rows;
  });

  protected remainingAmount = computed(() => {
    const details = this.details();
    return details ? Math.max(0, details.totalPrice - details.paidAmount) : 0;
  });

  protected remainingLabel = computed(() =>
    this.remainingAmount() > 0 ? priceConverter(this.remainingAmount()) : 'Isplaćeno u celosti',
  );

  protected paidPercent = computed(() => {
    const details = this.details();
    if (!details || details.totalPrice <= 0) return details ? 100 : 0;
    return Math.min(100, Math.round((details.paidAmount / details.totalPrice) * 100));
  });
}
