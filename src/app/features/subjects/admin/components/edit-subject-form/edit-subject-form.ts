import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { SubjectItem } from '../../../models/subject-item';
import { dateConverter } from '../../../../../core/utilities/date-helpers';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidCheck,
  faSolidClockRotateLeft,
  faSolidTrashCan,
  faSolidUserGraduate,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../../shared/button/button';
import { SubjectService } from '../../../services/subject-service';
import { createSubjectForm } from '../../factories/subject-factories';
import { UpdateSubjectRequest } from '../../../models/update-subject-request';
import { FormField, submit } from '@angular/forms/signals';
import { ToastService } from '../../../../../core/services/toast-service';

type SubjectStat = {
  icon: string;
  value: string | number;
  label: string;
  tone: 'default' | 'danger';
};
@Component({
  imports: [NgIcon, Button, FormField],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidCheck,
      faSolidClockRotateLeft,
      faSolidTrashCan,
      faSolidUserGraduate,
      faSolidXmark,
    }),
  ],
  selector: 'app-edit-subject-form',
  styleUrl: './edit-subject-form.css',
  templateUrl: './edit-subject-form.html',
})
export class EditSubjectForm implements OnInit {
  selectedSubject = input.required<SubjectItem | null>();
  closeForm = output();
  updatedSubject = output<SubjectItem>();

  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);

  requestModel = signal<UpdateSubjectRequest>({
    id: 0,
    subjectName: '',
    subjectDescription: '',
  });

  isPending = this.subjectService.updateSubjectMutation.isPending;
  updateForm = createSubjectForm(this.requestModel);

  ngOnInit() {
    const subject = this.selectedSubject();
    this.requestModel.set({
      id: subject?.id ?? 0,
      subjectName: subject?.subjectName ?? '',
      subjectDescription: subject?.subjectDescription ?? '',
    });
  }

  onClose() {
    this.closeForm.emit();
  }

  stats = computed<SubjectStat[]>(() => {
    const subject = this.selectedSubject();
    if (!subject) {
      return [];
    }

    const stats: SubjectStat[] = [
      { icon: 'faSolidCalendar', value: subject.classesCount, label: 'Časovi', tone: 'default' },
      {
        icon: 'faSolidUserGraduate',
        value: subject.studentsCount,
        label: 'Studenti',
        tone: 'default',
      },
    ];

    if (subject.updatedAt) {
      stats.push({
        icon: 'faSolidClockRotateLeft',
        value: dateConverter(subject.updatedAt),
        label: 'Izmenjeno',
        tone: 'default',
      });
    }

    if (subject.deletedAt) {
      stats.push({
        icon: 'faSolidTrashCan',
        value: dateConverter(subject.deletedAt),
        label: 'Obrisano',
        tone: 'danger',
      });
    }

    return stats;
  });

  onSubmit() {
    submit(this.updateForm, async () => {
      try {
         await this.subjectService.updateSubjectMutation.mutateAsync(this.requestModel(), {
           onSuccess: (res) => {
             this.updateForm().reset();
             this.closeForm.emit();
             this.updatedSubject.emit(res);
           },
         });
        return [];
      }
      catch (err: any) {
        if (err.error.errorCode === 'Subject.AlreadyExists') {
          return {
            kind: 'server',
            message: 'Predmet sa ovim nazivom već postoji.',
            fieldTree: this.updateForm.subjectName,
          };
        }
        this.toastService.showError('Došlo je do greške prilikom ažuriranja predmeta. Pokušajte ponovo kasnije.');
        return;
      }
    })
  }
  
}
