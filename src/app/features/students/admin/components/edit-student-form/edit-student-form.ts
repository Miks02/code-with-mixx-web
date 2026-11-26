import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBuildingColumns,
  faSolidCalendar,
  faSolidCalendarCheck,
  faSolidCheck,
  faSolidDiagramProject,
  faSolidEnvelope,
  faSolidPhone,
  faSolidSpinner,
  faSolidUser,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '@core/models/account-status';
import { ToastService } from '@core/services/toast-service';
import { dateConverter } from '@core/utilities/date-helpers';
import { Button } from '@shared/components/button/button';
import { Panel } from '@shared/components/panel/panel';
import { createUpdateStudentForm } from '@features/students/factories/student-factories';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { UpdateStudentFormModel } from '@features/students/models/update-student-request';
import { StudentService } from '@features/students/services/student-service';
import { getErrorCode } from '@core/utilities/problem-details-helpers';
import { getStudentErrorMessage } from '@features/students/utilities/student-error-messages';

type StudentStat = {
  icon: string;
  value: string | number;
  label: string;
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
  imports: [NgIcon, Button, FormField, Panel],
  providers: [
    provideIcons({
      faSolidBuildingColumns,
      faSolidCalendar,
      faSolidCalendarCheck,
      faSolidCheck,
      faSolidDiagramProject,
      faSolidEnvelope,
      faSolidPhone,
      faSolidSpinner,
      faSolidUser,
      faSolidXmark,
    }),
  ],
  selector: 'app-edit-student-form',
  styleUrl: './edit-student-form.css',
  templateUrl: './edit-student-form.html',
})
export class EditStudentForm implements OnInit {
  private studentService = inject(StudentService);
  private toastService = inject(ToastService);

  protected store = inject(AdminStudentStore);

  selectedStudent = this.store.selectedStudent;

  requestModel = signal<UpdateStudentFormModel>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    university: '',
  });

  updateForm = createUpdateStudentForm(this.requestModel);

  ngOnInit() {
    const student = this.selectedStudent();
    this.requestModel.set({
      id: student?.id ?? '',
      firstName: student?.firstName ?? '',
      lastName: student?.lastName ?? '',
      email: student?.email ?? '',
      phoneNumber: student?.phoneNumber ?? '',
      university: student?.university ?? '',
    });
  }

  studentName = computed(() => {
    const student = this.selectedStudent();
    return student ? `${student.firstName} ${student.lastName}` : '';
  });

  status = computed<StatusMeta | null>(() => {
    const student = this.selectedStudent();
    return student ? STATUS_META[student.accountStatus] : null;
  });

  registeredAtLabel = computed(() => {
    const student = this.selectedStudent();
    return student ? dateConverter(student.registeredAt) : '';
  });

  stats = computed<StudentStat[]>(() => {
    const student = this.selectedStudent();
    if (!student) {
      return [];
    }

    return [
      { icon: 'faSolidCalendarCheck', value: student.totalReservations, label: 'Rezervacije' },
      { icon: 'faSolidCalendar', value: student.totalClasses, label: 'Časovi' },
      { icon: 'faSolidDiagramProject', value: student.totalProjects, label: 'Projekti' },
    ];
  });

  onSubmit() {
    return submit(this.updateForm, async () => {
      try {
        const updated = await this.studentService.updateStudentMutation.mutateAsync(
          this.requestModel(),
        );
        this.updateForm().reset();
        this.toastService.showSuccess('Podaci studenta su uspešno izmenjeni.');
        this.store.updateSelectedStudent(updated);
        this.store.stopEditing();

        return [];
      } catch (err) {
        const errorCode = getErrorCode(err);
        if (errorCode === 'User.UsernameAlreadyExists' || errorCode === 'User.EmailAlreadyExists') {
          return {
            kind: 'server',
            message: 'Korisnik sa ovom email adresom već postoji.',
            fieldTree: this.updateForm.email,
          };
        }
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
        return;
      }
    });
  }
}
