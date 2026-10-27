import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { provideIcons } from '@ng-icons/core';
import { faSolidCirclePlus } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { CreateSubjectRequest } from '@features/subjects/models/create-subject-request';
import { SubjectService } from '@features/subjects/services/subject-service';
import { createSubjectForm } from '@features/subjects/admin/factories/subject-factories';
import { ToastService } from '@core/services/toast-service';
import { getErrorCode } from '@core/utilities/problem-details-helpers';

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
      } catch (err) {
        if (getErrorCode(err) === 'Subject.AlreadyExists') {
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
