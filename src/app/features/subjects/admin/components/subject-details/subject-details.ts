import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidClockRotateLeft,
  faSolidHandPointer,
  faSolidPenToSquare,
  faSolidTrashCan,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';
import { dateConverter } from '../../../../../core/utilities/date-helpers';
import { Button } from '../../../../../shared/button/button';
import { SubjectItem } from '../../../models/subject-item';
import { SubjectService } from '../../../services/subject-service';

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

  private subjectService = inject(SubjectService);

  onEdit() {
    this.editSubject.emit(this.subject()!);
  }

  onDelete() {
    this.subjectService.deleteSubjectMutation.mutate(this.subject()!.id, {
      onSuccess: () => this.deleteSubject.emit(),
      onError: (err) => console.error(err)
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
        icon: 'faSolidTrashCan',
        value: dateConverter(subject.deletedAt),
        label: 'Obrisano',
        tone: 'danger',
      });
    }

    return stats;
  });
}
