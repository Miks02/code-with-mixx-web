import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from '../../../../../shared/button/button';
import { StudentLookup, StudentService } from '../../../../students';
import { SubjectService } from '../../../../subjects';
import { createReservationFormModel } from '../../../factories/project-factories';
import { ProjectFormService } from '../../../services/project-form-service';
import { ProjectService } from '../../../services/project-service';
import { ProjectReservationListForm } from '../../components/project-reservation-list-form/project-reservation-list-form';
import { ProjectReservationPricing } from '../../components/project-reservation-pricing/project-reservation-pricing';
import { ProjectReservationSummary } from '../../components/project-reservation-summary/project-reservation-summary';
import { StudentSelection } from '../../components/student-selection/student-selection';

@Component({
  imports: [
    RouterLink,
    Button,
    StudentSelection,
    ProjectReservationListForm,
    ProjectReservationPricing,
    ProjectReservationSummary,
  ],
  providers: [ProjectFormService],
  selector: 'app-project-reservation-details-page',
  styleUrl: './project-reservation-details-page.css',
  templateUrl: './project-reservation-details-page.html',
})
export class ProjectReservationDetailsPage {
  private projectService = inject(ProjectService);
  private activatedRouter = inject(ActivatedRoute);
  studentService = inject(StudentService);
  subjectService = inject(SubjectService);
  projectFormService = inject(ProjectFormService);

  reservationModel = this.projectFormService.reservationModel;
  reservationForm = this.projectFormService.reservationForm;

  reservationId = signal(Number(this.activatedRouter.snapshot.paramMap.get('id')));

  private reservationDetailsQuery = this.projectService.getProjectReservationDetailsQuery(
    this.reservationId,
  );
  reservationDetails = this.reservationDetailsQuery.data;

  private availableStudentsQuery = this.studentService.getStudentsLookupQuery;

  areStudentsFetching = this.availableStudentsQuery.isFetching;
  availableStudents = computed(() => this.availableStudentsQuery.data());
  selectedStudent = computed(
    () =>
      this.availableStudents()?.find(
        (student) => student.id === this.projectFormService.reservationModel().studentId,
      ) ?? null,
  );

  private subjectsLookupQuery = this.subjectService.getSubjectsLookupQuery();
  areSubjectsFetching = this.subjectsLookupQuery.isFetching;
  subjectsLookup = computed(() => this.subjectsLookupQuery.data());

  constructor() {
    effect(() => {
      const details = this.reservationDetails();
      if (!details) return;

      this.reservationModel.set(createReservationFormModel(details));
    });
  }

  onStudentSelected(student: StudentLookup | null) {
    this.projectFormService.reservationForm.studentId().value.set(student?.id ?? '');
  }

  onSubmit() {}
}
