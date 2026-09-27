import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
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
import { AccountStatus } from '../../../../core/models/account-status';
import { ToastService } from '../../../../core/services/toast-service';
import { dateConverter } from '../../../../core/utilities/date-helpers';
import { Button } from '../../../../shared/button/button';
import { createUpdateStudentForm } from '../../factories/student-factories';
import { StudentItem } from '../../models/student-item';
import { UpdateStudentFormModel, UpdateStudentResponse } from '../../models/update-student-request';
import { StudentService } from '../../services/student-service';

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
  imports: [NgIcon, Button, FormField],
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

  selectedStudent = input.required<StudentItem | null>();
  closeForm = output<void>();
  updatedStudent = output<UpdateStudentResponse>();

  requestModel = signal<UpdateStudentFormModel>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    university: '',
  });

  updateForm = createUpdateStudentForm(this.requestModel);
  isPending = this.studentService.updateStudentMutation.isPending;

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

  onClose() {
    this.closeForm.emit();
  }

  onSubmit() {
    return submit(this.updateForm, async () => {
      try {
        const updated = await this.studentService.updateStudentMutation.mutateAsync(
          this.requestModel(),
        );
        this.updateForm().reset();
        this.toastService.showSuccess('Podaci studenta su uspešno izmenjeni.');
        this.updatedStudent.emit(updated);
        this.closeForm.emit();

        return [];
      } catch (err: any) {
        const errorCode = err?.error?.errorCode;
        if (errorCode === 'User.UsernameAlreadyExists') {
          return {
            kind: 'server',
            message: 'Korisnik sa ovom email adresom već postoji.',
            fieldTree: this.updateForm.email,
          };
        }
        if (errorCode === 'Student.NotFound') {
          this.toastService.showError('Došlo je do greške. Student nije pronađen.');
          return;
        }
        this.toastService.showError(
          'Došlo je do greške prilikom izmene studenta. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
