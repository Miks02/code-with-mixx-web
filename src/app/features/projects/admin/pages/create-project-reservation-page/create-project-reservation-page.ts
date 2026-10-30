import { Component, computed, inject } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { StudentLookup, StudentSelection, StudentService } from '@features/students';
import { SubjectService } from '@features/subjects';
import { createProjectReservationRequest } from '@features/projects/factories/project-factories';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectService } from '@features/projects/services/project-service';
import { getProjectReservationErrorMessage } from '@features/projects/utilities/project-error-messages';
import { ProjectReservationListForm } from '@features/projects/admin/components/project-reservation-list-form/project-reservation-list-form';
import { ProjectReservationPricing } from '@features/projects/admin/components/project-reservation-pricing/project-reservation-pricing';
import { ProjectReservationSummary } from '@features/projects/admin/components/project-reservation-summary/project-reservation-summary';

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
  selector: 'app-create-project-reservation-page',
  styleUrl: './create-project-reservation-page.css',
  templateUrl: './create-project-reservation-page.html',
})
export class CreateProjectReservationPage {
  studentService = inject(StudentService);
  subjectService = inject(SubjectService);
  projectFormService = inject(ProjectFormService);
  projectService = inject(ProjectService);
  toastService = inject(ToastService);
  router = inject(Router);

  reservationModel = this.projectFormService.reservationModel;
  reservationForm = this.projectFormService.reservationForm;

  private availableStudentsQuery = this.studentService.getStudentsLookupQuery;
  private createReservationMutation = this.projectService.createProjectReservationMutation;

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

  onStudentSelected(student: StudentLookup | null) {
    this.projectFormService.reservationForm.studentId().value.set(student?.id ?? '');
  }

  onSubmit() {
    return submit(this.reservationForm, async () => {
      const request = createProjectReservationRequest(this.reservationModel());

      try {
        await this.createReservationMutation.mutateAsync(request);
        this.toastService.showSuccess('Rezervacija je uspešno kreirana.');
        this.router.navigateByUrl('/admin/projects');
      } catch (err) {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
