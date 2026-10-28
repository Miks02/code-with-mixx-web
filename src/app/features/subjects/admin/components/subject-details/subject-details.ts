import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidClockRotateLeft,
  faSolidHandPointer,
  faSolidPenToSquare,
  faSolidSpinner,
  faSolidTrashCan,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';
import { currentDate, dateConverter } from '@core/utilities/date-helpers';
import { Button } from '@shared/components/button/button';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { SubjectService } from '@features/subjects/services/subject-service';
import { DialogService } from '@core/services/dialog-service';
import { DialogResult } from '@core/components/dialog/dialog';
import { ToastService } from '@core/services/toast-service';
import { getSubjectErrorMessage } from '@features/subjects/utilities/subject-error-messages';

type SubjectStat = {
  icon: string;
  value: string | number;
  label: string;
  tone: 'default' | 'danger';
};

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidClockRotateLeft,
      faSolidHandPointer,
      faSolidPenToSquare,
      faSolidTrashCan,
      faSolidUserGraduate,
      faSolidSpinner,
    }),
  ],
  selector: 'app-subject-details',
  styleUrl: './subject-details.css',
  templateUrl: './subject-details.html',
})
export class SubjectDetails {
  subject = input<SubjectItem>();
  editSubject = output<SubjectItem>();
  deleteSubject = output();
  updatedSubject = output<SubjectItem>();

  private subjectService = inject(SubjectService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  isUpdating = computed(() => {
    return (
      this.subjectService.archiveSubjectMutation.isPending() ||
      this.subjectService.deleteSubjectMutation.isPending() ||
      this.subjectService.restoreSubjectMutation.isPending()
    );
  });

  onEdit() {
    this.editSubject.emit(this.subject()!);
  }

  onArchive() {
    this.subjectService.archiveSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () =>
        this.updatedSubject.emit({
          ...this.subject()!,
          deletedAt: currentDate(),
        }),
      onError: (err) => {
        const message = getSubjectErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  onRestore() {
    this.subjectService.restoreSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () =>
        this.updatedSubject.emit({
          ...this.subject()!,
          deletedAt: null,
        }),
      onError: (err) => {
        const message = getSubjectErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  async onDelete() {
    const dialog = await this.dialogService.showDialog({
      title: 'Brisanje predmeta',
      message: `Da li sigurno želiš da obrišeš predmet „${this.subject()!.subjectName}”?`,
    });

    if (dialog === DialogResult.Cancelled) return;

    this.subjectService.deleteSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () => {
        this.toastService.showSuccess('Predmet je uspešno obrisan.');
        this.deleteSubject.emit();
      },
      onError: (err) => {
        const message = getSubjectErrorMessage(err);
        if (message) this.toastService.showError(message);
      },
    });
  }

  stats = computed<SubjectStat[]>(() => {
    const subject = this.subject();
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
        icon: 'faSolidBoxArchive',
        value: dateConverter(subject.deletedAt),
        label: 'Arhivirano',
        tone: 'danger',
      });
    }

    return stats;
  });
}
