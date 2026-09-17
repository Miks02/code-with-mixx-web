import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { provideIcons } from '@ng-icons/core';
import { faSolidCirclePlus } from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../../shared/button/button';
import { CreateSubjectRequest } from '../../../models/create-subject-request';
import { SubjectService } from '../../../services/subject-service';
import { createSubjectForm } from '../../factories/subject-factories';
import { ToastService } from '../../../../../core/services/toast-service';

@Component({
  imports: [FormField, Button],
  providers: [provideIcons({ faSolidCirclePlus })],
  selector: 'app-create-subject-form',
  styleUrl: './create-subject-form.css',
  templateUrl: './create-subject-form.html',
})
export class CreateSubjectForm {
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);

  requestModel = signal<CreateSubjectRequest>({
    subjectName: '',
    subjectDescription: '',
  });

  subjectForm = createSubjectForm(this.requestModel);
  createSubjectMutation = this.subjectService.createSubjectMutation;

  onSubmit() {
    return submit(this.subjectForm, async () => {
      try {
        await this.createSubjectMutation.mutateAsync(this.requestModel());
        this.requestModel.set({ subjectName: '', subjectDescription: '' });
        this.subjectForm().reset();
        this.toastService.showSuccess('Predmet je uspešno dodat');

        return [];
      } catch (err: any) {
        console.error(err);
        if (err.error.errorCode === 'Subject.AlreadyExists') {
          return {
            kind: 'server',
            message: 'Predmet sa ovim nazivom već postoji.',
            fieldTree: this.subjectForm.subjectName,
          };
        }
        this.toastService.showError(
          'Došlo je do greške prilikom kreiranja predmeta. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
