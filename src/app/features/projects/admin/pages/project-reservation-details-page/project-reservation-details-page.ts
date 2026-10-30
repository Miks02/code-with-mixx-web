import { Component, computed, effect, inject, signal } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { StudentLookup, StudentSelection, StudentService } from '@features/students';
import { SubjectService } from '@features/subjects';
import {
  createReservationFormModel,
  createUpdateProjectReservationRequest,
} from '@features/projects/factories/project-factories';
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
  selector: 'app-project-reservation-details-page',
  styleUrl: './project-reservation-details-page.css',
  templateUrl: './project-reservation-details-page.html',
})
export class ProjectReservationDetailsPage {
  private projectService = inject(ProjectService);
  private activatedRouter = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private subjectService = inject(SubjectService);
  private projectFormService = inject(ProjectFormService);
  private router = inject(Router);
  private toastService = inject(ToastService);

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

  private updateProjectReservationMutation = this.projectService.updateProjectReservationMutation;

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

  onSubmit() {
    return submit(this.reservationForm, async () => {
      const request = createUpdateProjectReservationRequest(this.reservationModel());

      try {
        await this.updateProjectReservationMutation.mutateAsync(request);
        this.toastService.showSuccess('Rezervacija je uspešno ažurirana.');
        this.router.navigateByUrl('/admin/projects');
      } catch (err) {
        const message = getProjectReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
