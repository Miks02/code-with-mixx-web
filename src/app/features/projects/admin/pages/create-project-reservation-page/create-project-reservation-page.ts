import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Button } from '../../../../../shared/button/button';
import { ReservationStatus } from '../../../../reservations';
import { StudentLookup, StudentService } from '../../../../students';
import { SubjectService } from '../../../../subjects';
import { createProjectReservationFormFactory } from '../../../factories/project-factories';
import { ProjectReservationFormModel } from '../../../models/project-reservation-request';
import { ProjectFormService } from '../../../services/project-form-service';
import { ProjectReservationListForm } from '../../components/project-reservation-list-form/project-reservation-list-form';
import { StudentSelection } from '../../components/student-selection/student-selection';
import { ProjectReservationPricing } from '../../components/project-reservation-pricing/project-reservation-pricing';

@Component({
  imports: [RouterLink, Button, NgIcon, StudentSelection, ProjectReservationListForm, ProjectReservationPricing],
  providers: [ProjectFormService],
  selector: 'app-create-project-reservation-page',
  styleUrl: './create-project-reservation-page.css',
  templateUrl: './create-project-reservation-page.html',
})
export class CreateProjectReservationPage {
  studentService = inject(StudentService);
  subjectService = inject(SubjectService);

  reservationModel: WritableSignal<ProjectReservationFormModel> = signal({
    studentId: '',
    paidAmount: 0,
    totalPrice: 0,
    progress: 0,
    reservationStatus: ReservationStatus.Confirmed,
    projects: []
  })

  reservationForm = createProjectReservationFormFactory(this.reservationModel);

  private availableStudentsQuery = this.studentService.getStudentsLookupQuery;
  areStudentsFetching = this.availableStudentsQuery.isFetching;
  availableStudents = computed(() => this.availableStudentsQuery.data());
  selectedStudent = signal<StudentLookup | null>(null);

  private subjectsLookupQuery = this.subjectService.getSubjectsLookupQuery();
  areSubjectsFetching = this.subjectsLookupQuery.isFetching;
  subjectsLookup = computed(() => this.subjectsLookupQuery.data());

  onStudentSelected(student: StudentLookup | null) {
    this.selectedStudent.set(student);
  }
}
