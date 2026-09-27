import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidCalendarCheck,
  faSolidDiagramProject,
  faSolidGraduationCap,
  faSolidTrophy,
} from '@ng-icons/font-awesome/solid';
import { Skeleton } from '../../../../shared/skeleton/skeleton';
import { StudentItem } from '../../models/student-item';

type MostActiveStudentStat = {
  icon: string;
  value: number;
  label: string;
};

@Component({
  imports: [NgIcon, Skeleton],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidCalendarCheck,
      faSolidDiagramProject,
      faSolidGraduationCap,
      faSolidTrophy,
    }),
  ],
  selector: 'app-most-active-student',
  styleUrl: './most-active-student.css',
  templateUrl: './most-active-student.html',
})
export class MostActiveStudent {
  student = input<Omit<StudentItem, 'deletedAt'> | null>();
  isPending = input<boolean>(false);

  studentName = computed(() => {
    const student = this.student();
    return student ? `${student.firstName} ${student.lastName}` : '';
  });

  studentInitials = computed(() => {
    const student = this.student();
    return student ? `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase() : '';
  });

  stats = computed<MostActiveStudentStat[]>(() => {
    const student = this.student();
    if (!student) {
      return [];
    }

    return [
      { icon: 'faSolidCalendarCheck', value: student.totalReservations, label: 'Rezervacije' },
      { icon: 'faSolidCalendar', value: student.totalClasses, label: 'Časovi' },
      { icon: 'faSolidDiagramProject', value: student.totalProjects, label: 'Projekti' },
    ];
  });
}
