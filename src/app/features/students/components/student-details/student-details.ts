import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidCalendarCheck,
  faSolidDiagramProject,
  faSolidEnvelope,
  faSolidEye,
  faSolidGraduationCap,
  faSolidHandPointer,
  faSolidIdCard,
  faSolidPaperPlane,
  faSolidPenToSquare,
  faSolidPhone,
  faSolidTrashCan,
  faSolidUserCheck,
  faSolidUserSlash,
} from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '../../../../core/models/account-status';
import { dateConverter } from '../../../../core/utilities/date-helpers';
import { Button } from '../../../../shared/button/button';
import { StudentItem } from '../../models/student-item';

type StudentStat = {
  icon: string;
  value: string | number;
  label: string;
  tone: 'default' | 'danger';
};

type StatusMeta = {
  label: string;
  classes: string;
};

const STATUS_META: Record<AccountStatus, StatusMeta> = {
  [AccountStatus.Active]: { label: 'Aktivan', classes: 'bg-emerald-900/80 text-emerald-100' },
  [AccountStatus.Pending]: { label: 'Na čekanju', classes: 'bg-amber-900/60 text-amber-100' },
  [AccountStatus.Deactivated]: {
    label: 'Deaktiviran',
    classes: 'bg-orange-950/60 text-orange-100',
  },
  [AccountStatus.Deleted]: { label: 'Obrisan', classes: 'bg-red-950/60 text-red-100' },
};

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidCalendarCheck,
      faSolidDiagramProject,
      faSolidEnvelope,
      faSolidEye,
      faSolidGraduationCap,
      faSolidHandPointer,
      faSolidIdCard,
      faSolidPaperPlane,
      faSolidPenToSquare,
      faSolidPhone,
      faSolidTrashCan,
      faSolidUserSlash,
      faSolidUserCheck
    }),
  ],
  selector: 'app-student-details',
  styleUrl: './student-details.css',
  templateUrl: './student-details.html',
})
export class StudentDetails {
  readonly AccountStatus = AccountStatus;

  student = input<StudentItem>();

  studentName = computed(() => {
    const student = this.student();
    return student ? `${student.firstName} ${student.lastName}` : '';
  });

  status = computed<StatusMeta | null>(() => {
    const student = this.student();
    return student ? STATUS_META[student.accountStatus] : null;
  });

  deletedAtLabel = computed(() => {
    const deletedAt = this.student()?.deletedAt;
    return deletedAt ? dateConverter(deletedAt) : '';
  });

  registeredAtLabel = computed(() => {
    const student = this.student();
    return student ? dateConverter(student.registeredAt) : '';
  });

  stats = computed<StudentStat[]>(() => {
    const student = this.student();
    if (!student) {
      return [];
    }

    const stats: StudentStat[] = [
      {
        icon: 'faSolidCalendarCheck',
        value: student.totalReservations,
        label: 'Rezervacije',
        tone: 'default',
      },
      { icon: 'faSolidCalendar', value: student.totalClasses, label: 'Časovi', tone: 'default' },
      {
        icon: 'faSolidDiagramProject',
        value: student.totalProjects,
        label: 'Projekti',
        tone: 'default',
      },
      {
        icon: 'faSolidGraduationCap',
        value: student.university ?? 'Nije upisano',
        label: 'Fakultet',
        tone: 'default',
      },
    ];

    return stats;
  });
}
