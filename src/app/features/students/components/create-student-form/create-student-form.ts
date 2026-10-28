import { Component, inject, input, output, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBuildingColumns,
  faSolidEnvelope,
  faSolidPhone,
  faSolidUser,
  faSolidUserPlus,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { createStudentForm } from '@features/students/factories/student-factories';
import { CreateStudentFormModel } from '@features/students/models/create-student-request';
import { StudentService } from '@features/students/services/student-service';
import { getErrorCode } from '@core/utilities/problem-details-helpers';

const emptyStudentModel: CreateStudentFormModel = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  university: '',
};

@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
      faSolidBuildingColumns,
      faSolidEnvelope,
      faSolidPhone,
      faSolidUser,
      faSolidUserPlus,
      faSolidXmark,
    }),
  ],
  selector: 'app-create-student-form',
  styleUrl: './create-student-form.css',
  templateUrl: './create-student-form.html',
})
export class CreateStudentForm {
  private studentService = inject(StudentService);
  private toastService = inject(ToastService);

  isVisible = input.required<boolean>();
  closed = output<void>();

  studentModel = signal<CreateStudentFormModel>(emptyStudentModel);
  studentForm = createStudentForm(this.studentModel);
  createStudentMutation = this.studentService.createStudentMutation;

  onClose() {
    this.studentModel.set(emptyStudentModel);
    this.studentForm().reset();
    this.closed.emit();
  }

  onSubmit() {
    return submit(this.studentForm, async () => {
      try {
        await this.createStudentMutation.mutateAsync(this.studentModel());
        this.studentModel.set(emptyStudentModel);
        this.studentForm().reset();
        this.toastService.showSuccess('Student je uspešno registrovan.');
        this.closed.emit();

        return [];
      } catch (err) {
        if (getErrorCode(err) === 'User.UsernameAlreadyExists') {
          return {
            kind: 'server',
            message: 'Korisnik sa ovom email adresom već postoji.',
            fieldTree: this.studentForm.email,
          };
        }
        return;
      }
    });
  }
}
