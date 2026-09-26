import { Component, computed, inject, input } from '@angular/core';
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
  faSolidSpinner,
  faSolidTrashCan,
  faSolidUserCheck,
  faSolidUserSlash,
} from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '../../../../core/models/account-status';
import { dateConverter } from '../../../../core/utilities/date-helpers';
import { Button } from '../../../../shared/button/button';
import { StudentItem } from '../../models/student-item';
import { StudentService } from '../../services/student-service';
import { ToastService } from '../../../../core/services/toast-service';
import { DialogService } from '../../../../core/services/dialog-service';
import { DialogResult } from '../../../../core/components/dialog/dialog';
import { ProblemDetails } from '../../../../core/models/problem-details';

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
      faSolidSpinner,
      faSolidTrashCan,
      faSolidUserSlash,
      faSolidUserCheck,
    }),
  ],
  selector: 'app-student-details',
  styleUrl: './student-details.css',
  templateUrl: './student-details.html',
})
export class StudentDetails {
  private studentService = inject(StudentService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);

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

  private deleteMutation = this.studentService.deleteStudentMutation;
  private deactivateMutation = this.studentService.deactivateStudentMutation;
  private activateMutation = this.studentService.activateStudentMutation;
  private sendInvitationMutation = this.studentService.sendInvitationMutation;

  isPending = computed(
    () =>
      this.deleteMutation.isPending() ||
      this.deactivateMutation.isPending() ||
      this.activateMutation.isPending() ||
      this.sendInvitationMutation.isPending(),
  );

  onActivate() {
    this.activateMutation.mutate(this.student()?.id!, {
      onSuccess: () => {
        this.toastService.showSuccess('Nalog je uspešno aktiviran.');
      },
      onError: (err: any) => {
        const errorCode = err?.error.errorCode;
        if (errorCode === 'User.CannotChangeStatusForDeletedUser') {
          this.toastService.showInfo('Nalog je obrisan pa mu status ne može biti promenjen.');
          return;
        }
        if (errorCode === 'User.CannotActivateWithNullPassword') {
          this.toastService.showError(
            'Nalog ne može biti aktiviran jer korisnik nije postavio lozinku.',
          );
          return;
        }
        if (errorCode === 'User.AlreadyActivated') {
          this.toastService.showInfo('Nalog je već aktivan.');
          return;
        }
        if (errorCode === 'Student.NotFound') {
          this.toastService.showError('Došlo je do greške. Student nije pronađen.');
          return;
        }
        this.toastService.showError('Došlo je do neočekivane greške. Pokušajte ponovo kasnije.');
      },
    });
  }

  onDeactivate() {
    this.deactivateMutation.mutate(this.student()?.id!, {
      onSuccess: () => {
        this.toastService.showSuccess('Nalog je uspešno deaktiviran.');
      },
      onError: (err: any) => {
        const errorCode = err?.error.errorCode;
        if (errorCode === 'User.CannotChangeStatusForDeletedUser') {
          this.toastService.showInfo('Nalog je obrisan pa mu status ne može biti promenjen.');
          return;
        }
        if (errorCode === 'User.AlreadyDeactivated') {
          this.toastService.showInfo('Nalog je već deaktiviran.');
          return;
        }
        if (errorCode === 'Student.NotFound') {
          this.toastService.showError('Došlo je do greške. Student nije pronađen.');
          return;
        }
        this.toastService.showError('Došlo je do neočekivane greške. Pokušajte ponovo kasnije.');
      },
    });
  }

  onSendInvitation() {
    this.studentService.sendInvitationMutation.mutate(this.student()?.id!, {
      onSuccess: () => {
        this.toastService.showSuccess('Pozivnica je uspešno poslata.');
      },
      onError: (err: any) => {
        const errorCode = err?.error?.errorCode;
        if (errorCode === 'User.NotFound') {
          this.toastService.showError('Došlo je do greške. Korisnik nije pronađen.');
          return;
        }
        if(errorCode === "User.AccountDeactivated") {
          this.toastService.showError('Nalog izabranog studenta je deaktiviran. Slanje pozivnice nije moguće.');
          return;
        }
        if (errorCode === 'User.AlreadyActivated') {
          this.toastService.showInfo('Nalog je već aktiviran pa pozivnica nije potrebna.');
          return;
        }
        if (errorCode === 'User.NotAStudent') {
          this.toastService.showError('Pozivnica se može poslati samo studentu.');
          return;
        }
        this.toastService.showError('Došlo je do greške. Pozivnica nije poslata.');
      },
    });
  }

  async onDelete() {
    const dialogMessage =
      this.student()?.totalReservations! > 0
        ? 'Izabrani student ima rezervacije i neće biti potpuno obrisan.'
        : 'Da li ste sigurni da želite da obrišete ovog studenta?';

    const dialogResult = await this.dialogService.showDialog({
      title: 'Potvrda brisanja',
      message: dialogMessage,
    });

    if (dialogResult === DialogResult.Cancelled) return;

    this.studentService.deleteStudentMutation.mutate(this.student()?.id!, {
      onSuccess: () => {
        this.toastService.showSuccess('Student je uspešno obrisan.');
      },
      onError: (err: any) => {
        const errorCode = err?.error.errorCode;
        if (errorCode === 'Student.NotFound') {
          this.toastService.showError('Došlo je do greške. Student nije pronađen.');
          return;
        }
        this.toastService.showError('Došlo je do neočekivane greške. Pokušajte ponovo kasnije.');
      },
    });
  }
}
