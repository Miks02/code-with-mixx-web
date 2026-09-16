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
import { currentDate, dateConverter } from '../../../../../core/utilities/date-helpers';
import { Button } from '../../../../../shared/button/button';
import { SubjectItem } from '../../../models/subject-item';
import { SubjectService } from '../../../services/subject-service';
import { DialogService } from '../../../../../core/services/dialog-service';
import { DialogResult } from '../../../../../core/components/dialog/dialog';

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
      onError: (err) => console.error(err),
    });
  }

  onRestore() {
    this.subjectService.restoreSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () =>
        this.updatedSubject.emit({
          ...this.subject()!,
          deletedAt: null,
        }),
      onError: (err) => console.error(err),
    });
  }

  async onDelete() {
    const dialog = await this.dialogService.showDialog({
      title: 'Brisanje predmeta',
      message: `Da li ste sigurni da želite da obrišete predmet „${this.subject()!.subjectName}”?`,
    });

    if (dialog === DialogResult.Cancelled) return;

    this.subjectService.deleteSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () => this.deleteSubject.emit(),
      onError: (err) => console.error(err),
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
