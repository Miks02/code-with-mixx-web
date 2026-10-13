import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Button } from '../../../../../shared/button/button';
import { StudentLookup, StudentService } from '../../../../students';
import { StudentSelection } from '../../components/student-selection/student-selection';

@Component({
  imports: [RouterLink, Button, NgIcon, StudentSelection],
  selector: 'app-create-project-reservation-page',
  styleUrl: './create-project-reservation-page.css',
  templateUrl: './create-project-reservation-page.html',
})
export class CreateProjectReservationPage {
  studentService = inject(StudentService);

  private availableStudentsQuery = this.studentService.getStudentsLookupQuery;
  areStudentsFetching = this.availableStudentsQuery.isFetching;
  availableStudents = computed(() => this.availableStudentsQuery.data());
  selectedStudent = signal<StudentLookup | null>(null);

  onStudentSelected(student: StudentLookup | null) {
    this.selectedStudent.set(student);
  }
}
