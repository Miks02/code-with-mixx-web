import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { StudentItem } from '../../models/student-item';

@Component({
  imports: [NgIcon],
  selector: 'app-student-card',
  styleUrl: './student-card.css',
  templateUrl: './student-card.html',
})
export class StudentCard {
  student = input.required<StudentItem>();
  isSelected = input<boolean>(false);
  addOpacity = input<boolean>(false);
  selected = output<StudentItem>();

  studentName = computed(() => `${this.student().firstName} ${this.student().lastName}`);
  studentEmail = computed(() => this.student().email);
  studentInitials = computed(() => {
    const { firstName, lastName } = this.student();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  });

  containerClasses = computed(() =>
    this.isSelected()
      ? 'p-4 rounded-lg flex flex-col gap-3 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-600'
      : 'p-4 rounded-lg flex flex-col gap-3 hover:bg-emerald-800/80 active:scale-95 transition-200 cursor-pointer flex-1 grow bg-emerald-900/80',
  );

  onClick() {
    this.selected.emit(this.student());
  }
}
