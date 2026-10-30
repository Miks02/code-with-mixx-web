import { Component, effect, input, output, signal, WritableSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { StudentLookup } from '@features/students/models/student-lookup';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark })],
  selector: 'app-student-selection',
  styleUrl: './student-selection.css',
  templateUrl: './student-selection.html',
})
export class StudentSelection {
  availableStudents = input.required<StudentLookup[] | undefined>();
  selectedStudent = input<StudentLookup | null>(null);
  studentSelected = output<StudentLookup | null>();
  studentsList: WritableSignal<StudentLookup[]> = signal([]);

  constructor() {
    effect(() => {
      const availableStudents = this.availableStudents();
      if (!availableStudents) return;

      this.studentsList.set(availableStudents);
    });
  }

  onStudentSelected(student: StudentLookup | null) {
    this.studentSelected.emit(student);
  }

  getInitials(fullName: string): string {
    const names = fullName.trim().split(/\s+/).filter(Boolean);
    if (names.length === 0) return '';

    const first = names[0][0];
    const last = names.length > 1 ? names[names.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  onSearchChanged(searchTerm: Event) {
    const term = (searchTerm.target as HTMLInputElement).value.toLowerCase();

    if (!this.availableStudents()) return;

    const newStudentList = this.availableStudents()!.filter(
      (s) => s.fullName.toLowerCase().includes(term) || s.email.toLowerCase().includes(term),
    );

    this.studentsList.set(newStudentList);
  }
}
