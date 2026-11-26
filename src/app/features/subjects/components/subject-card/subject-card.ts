import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [NgIcon],
  selector: 'app-subject-card',
  templateUrl: './subject-card.html',
  host: { class: 'grow' },
})
export class SubjectCard {
  subjectName = input.required<string>();
  subjectDescription = input.required<string>();
  classesCount = input<number>();
  studentsCount = input<number>();
  isSelected = input<boolean>(false);
  addOpacity = input<boolean>(false);
  selected = output<void>();

  containerClasses = computed(() =>
    this.isSelected()
      ? 'w-full text-left p-4 rounded-lg flex flex-col gap-3 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-600'
      : 'w-full text-left p-4 rounded-lg flex flex-col gap-3 hover:bg-emerald-800/80 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-900/80',
  );
}
