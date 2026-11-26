import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { DialogResult } from '@core/components/dialog/dialog';
import { AccountStatus } from '@core/models/account-status';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { dateConverter } from '@core/utilities/date-helpers';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Panel } from '@shared/components/panel/panel';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { StudentService } from '@features/students/services/student-service';
import { getStudentErrorMessage } from '@features/students/utilities/student-error-messages';
import { ACCOUNT_STATUS_META } from '@features/students/utilities/student-labels';
import { StatusMeta } from '@features/reservations';

type StudentStat = {
  icon: string;
  value: string | number;
  label: string;
  tone: 'default' | 'danger';
};

@Component({
  imports: [NgIcon, Button, RouterLink, Panel, EmptyState],
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
  templateUrl: './student-details.html',
  host: { class: 'flex-1' },
})
export class StudentDetails {
  private studentService = inject(StudentService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);
  protected store = inject(AdminStudentStore);

  readonly AccountStatus = AccountStatus;
  readonly detailsLink = computed(() => {
    const student = this.student();
    return student ? ['/admin/students/details', student.id] : null;
  });

  student = this.store.selectedStudent;

  studentName = computed(() => {
    const student = this.student();
    return student ? `${student.firstName} ${student.lastName}` : '';
  });

  panelTitle = computed(() => {
    const student = this.student();
    if (!student) return 'Detalji studenta';
    if (student.accountStatus === AccountStatus.Deleted) return 'Nalog obrisan';
    return this.studentName();
  });

  status = computed<StatusMeta | null>(() => {
    const student = this.student();
    return student ? ACCOUNT_STATUS_META[student.accountStatus] : null;
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

  onActivate() {
    const student = this.student();
    if (!student) return;

    this.activateMutation.mutate(student.id, {
      onSuccess: () => {
        this.toastService.showSuccess('Nalog je uspešno aktiviran.');
        this.store.updateSelectedStudent({ accountStatus: AccountStatus.Active });
      },
      onError: (err) => {
        const errorCode = err.errorCode;
        if (errorCode === 'User.CannotChangeStatusForDeletedUser') {
          this.toastService.showInfo('Nalog je obrisan pa mu status ne može biti promenjen.');
          return;
        }
        if (errorCode === 'User.AlreadyActivated') {
          this.toastService.showInfo('Nalog je već aktivan.');
          return;
        }
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  onDeactivate() {
    const student = this.student();
    if (!student) return;

    this.deactivateMutation.mutate(student.id, {
      onSuccess: () => {
        this.toastService.showSuccess('Nalog je uspešno deaktiviran.');
        this.store.updateSelectedStudent({ accountStatus: AccountStatus.Deactivated });
      },
      onError: (err) => {
        const errorCode = err.errorCode;
        if (errorCode === 'User.CannotChangeStatusForDeletedUser') {
          this.toastService.showInfo('Nalog je obrisan pa mu status ne može biti promenjen.');
          return;
        }
        if (errorCode === 'User.AlreadyDeactivated') {
          this.toastService.showInfo('Nalog je već deaktiviran.');
          return;
        }
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  onSendInvitation() {
    const student = this.student();
    if (!student) return;

    this.sendInvitationMutation.mutate(student.id, {
      onSuccess: () => {
        this.toastService.showSuccess('Pozivnica je uspešno poslata.');
      },
      onError: (err) => {
        if (err.errorCode === 'User.AlreadyActivated') {
          this.toastService.showInfo('Nalog je već aktiviran pa pozivnica nije potrebna.');
          return;
        }
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDelete() {
    const student = this.student();
    if (!student) return;

    const dialogMessage =
      student.totalReservations > 0
        ? 'Izabrani student ima rezervacije i neće biti potpuno obrisan.'
        : 'Da li sigurno želiš da obrišeš ovog studenta?';

    const dialogResult = await this.dialogService.showDialog({
      title: 'Potvrda brisanja',
      message: dialogMessage,
    });

    if (dialogResult === DialogResult.Cancelled) return;

    this.deleteMutation.mutate(student.id, {
      onSuccess: () => {
        this.toastService.showSuccess('Student je uspešno obrisan.');
        this.store.selectStudent(undefined);
      },
      onError: (err) => {
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }
}
