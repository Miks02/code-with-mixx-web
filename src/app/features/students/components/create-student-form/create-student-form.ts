import { Component, DestroyRef, ElementRef, inject, input, output, signal } from '@angular/core';
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
import { ToastService } from '../../../../core/services/toast-service';
import { Button } from '../../../../shared/button/button';
import { createStudentForm } from '../../factories/student-factories';
import { CreateStudentFormModel } from '../../models/create-student-request';
import { StudentService } from '../../services/student-service';

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
      } catch (err: any) {
        if (err?.error?.errorCode === 'User.UsernameAlreadyExists') {
          return {
            kind: 'server',
            message: 'Korisnik sa ovom email adresom već postoji.',
            fieldTree: this.studentForm.email,
          };
        }
        this.toastService.showError(
          'Došlo je do greške prilikom registracije studenta. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
