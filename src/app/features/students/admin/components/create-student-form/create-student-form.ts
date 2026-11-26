import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBuildingColumns,
  faSolidEnvelope,
  faSolidPhone,
  faSolidUser,
  faSolidUserPlus,
} from '@ng-icons/font-awesome/solid';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { ModalOverlay } from '@shared/components/modal-overlay/modal-overlay';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { createStudentForm } from '@features/students/factories/student-factories';
import { CreateStudentFormModel } from '@features/students/models/create-student-request';
import { StudentService } from '@features/students/services/student-service';
import { getErrorCode } from '@core/utilities/problem-details-helpers';
import { getStudentErrorMessage } from '@features/students/utilities/student-error-messages';

const emptyStudentModel: CreateStudentFormModel = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  university: '',
};

@Component({
  imports: [NgIcon, Button, FormField, ModalOverlay],
  providers: [
    provideIcons({
      faSolidBuildingColumns,
      faSolidEnvelope,
      faSolidPhone,
      faSolidUser,
      faSolidUserPlus,
    }),
  ],
  selector: 'app-create-student-form',
  styleUrl: './create-student-form.css',
  templateUrl: './create-student-form.html',
})
export class CreateStudentForm {
  private studentService = inject(StudentService);
  private toastService = inject(ToastService);

  protected store = inject(AdminStudentStore);

  studentModel = signal<CreateStudentFormModel>(emptyStudentModel);
  studentForm = createStudentForm(this.studentModel);
  private createStudentMutation = this.studentService.createStudentMutation;

  onClose() {
    this.studentModel.set(emptyStudentModel);
    this.studentForm().reset();
    this.store.closeCreateModal();
  }

  onSubmit() {
    return submit(this.studentForm, async () => {
      try {
        await this.createStudentMutation.mutateAsync(this.studentModel());
        this.studentModel.set(emptyStudentModel);
        this.studentForm().reset();
        this.toastService.showSuccess('Student je uspešno registrovan.');
        this.store.closeCreateModal();

        return [];
      } catch (err) {
        const errorCode = getErrorCode(err);
        if (errorCode === 'User.UsernameAlreadyExists' || errorCode === 'User.EmailAlreadyExists') {
          return {
            kind: 'server',
            message: 'Korisnik sa ovom email adresom već postoji.',
            fieldTree: this.studentForm.email,
          };
        }
        const message = getStudentErrorMessage(err);
        if (message) this.toastService.showError(message);
        return;
      }
    });
  }
}
