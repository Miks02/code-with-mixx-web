import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SubjectItem } from '../../models/subject-item';

@Component({
  imports: [NgIcon],
  selector: 'app-subject-card',
  styleUrl: './subject-card.css',
  templateUrl: './subject-card.html',
})
export class SubjectCard {
  subject = input.required<SubjectItem>();
  isSelected = input<boolean>(false);

  selected = output<SubjectItem>();

  subjectName = computed(() => this.subject().subjectName);
  subjectDescription = computed(() => {
    const description = this.subject().subjectDescription;
    return description?.length > 50 ? description.slice(0, 40) + '...' : description;
  });

  containerClasses = computed(() =>
    this.isSelected()
      ? 'p-4 rounded-lg flex flex-col gap-3 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-600'
      : 'p-4 rounded-lg flex flex-col gap-3 hover:bg-emerald-800/80 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-900/80',
  );

  onClick() {
    this.selected.emit(this.subject());
  }
}
