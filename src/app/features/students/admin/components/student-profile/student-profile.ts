import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidClock,
  faSolidEnvelope,
  faSolidGraduationCap,
  faSolidIdCard,
  faSolidPhone,
  faSolidUserPlus,
} from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '@core/models/account-status';
import { dateConverter, dateTimeConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { AdminStudentDetailsStore } from '@features/students/admin/stores/admin-student-details-store';
import { ACCOUNT_STATUS_META } from '@features/students/utilities/student-labels';
import { Badge } from '@shared/components/badge/badge';

type InfoRow = {
  icon: string;
  label: string;
  value: string;
};

@Component({
  imports: [Badge, NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidClock,
      faSolidEnvelope,
      faSolidGraduationCap,
      faSolidIdCard,
      faSolidPhone,
      faSolidUserPlus,
    }),
  ],
  selector: 'app-student-profile',
  templateUrl: './student-profile.html',
})
export class StudentProfile {
  protected store = inject(AdminStudentDetailsStore);

  student = this.store.student;
  stats = this.store.stats;

  readonly AccountStatus = AccountStatus;
  readonly skeletonRows = Array.from({ length: 6 });

  fullName = computed(() => {
    const student = this.student();
    return student ? `${student.firstName} ${student.lastName}` : '';
  });

  initials = computed(() => {
    const student = this.student();
    if (!student) return '';
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  });

  status = computed(() => {
    const student = this.student();
    return student ? ACCOUNT_STATUS_META[student.accountStatus] : null;
  });

  infoRows = computed<InfoRow[]>(() => {
    const student = this.student();
    if (!student) return [];

    return [
      { icon: 'faSolidEnvelope', label: 'Email', value: student.email },
      { icon: 'faSolidPhone', label: 'Telefon', value: student.phoneNumber ?? 'Nije upisan' },
      {
        icon: 'faSolidGraduationCap',
        label: 'Fakultet',
        value: student.university ?? 'Nije upisan',
      },
      { icon: 'faSolidUserPlus', label: 'Registrovan', value: dateConverter(student.registeredAt) },
      {
        icon: 'faSolidClock',
        label: 'Poslednja prijava',
        value: student.lastLoginAt ? dateTimeConverter(student.lastLoginAt) : 'Nikad',
      },
      { icon: 'faSolidIdCard', label: 'ID', value: student.id },
    ];
  });

  deletedAtLabel = computed(() => {
    const deletedAt = this.student()?.deletedAt;
    return deletedAt ? dateConverter(deletedAt) : '';
  });

  totalPrice = computed(() => priceConverter(this.stats()?.totalPrice ?? 0));
  totalPaid = computed(() => priceConverter(this.stats()?.totalPaid ?? 0));
  totalRemaining = computed(() => priceConverter(this.stats()?.totalRemaining ?? 0));
  hasRemaining = computed(() => (this.stats()?.totalRemaining ?? 0) > 0);
}
