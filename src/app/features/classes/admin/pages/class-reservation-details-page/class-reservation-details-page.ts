import { Component, computed, effect, inject, signal } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { StudentLookup, StudentSelection, StudentService } from '@features/students';
import { SubjectService } from '@features/subjects';
import {
  createClassReservationFormModel,
  createUpdateClassReservationRequest,
} from '@features/classes/factories/class-factories';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassService } from '@features/classes/services/class-service';
import { getClassReservationErrorMessage } from '@features/classes/utilities/class-error-messages';
import { ClassReservationListForm } from '@features/classes/admin/components/class-reservation-list-form/class-reservation-list-form';
import { ClassReservationPricing } from '@features/classes/admin/components/class-reservation-pricing/class-reservation-pricing';
import { ClassReservationSummary } from '@features/classes/admin/components/class-reservation-summary/class-reservation-summary';

@Component({
  imports: [
    RouterLink,
    Button,
    StudentSelection,
    ClassReservationListForm,
    ClassReservationPricing,
    ClassReservationSummary,
  ],
  providers: [ClassFormService],
  selector: 'app-class-reservation-details-page',
  styleUrl: './class-reservation-details-page.css',
  templateUrl: './class-reservation-details-page.html',
})
export class ClassReservationDetailsPage {
  private classService = inject(ClassService);
  private activatedRouter = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private subjectService = inject(SubjectService);
  private classFormService = inject(ClassFormService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  reservationModel = this.classFormService.reservationModel;
  reservationForm = this.classFormService.reservationForm;

  reservationId = signal(Number(this.activatedRouter.snapshot.paramMap.get('id')));

  private reservationDetailsQuery = this.classService.getClassReservationDetailsQuery(
    this.reservationId,
  );
  reservationDetails = computed(() => this.reservationDetailsQuery.data());

  private availableStudentsQuery = this.studentService.getStudentsLookupQuery;

  areStudentsFetching = this.availableStudentsQuery.isFetching;
  availableStudents = computed(() => this.availableStudentsQuery.data());
  selectedStudent = computed(
    () =>
      this.availableStudents()?.find(
        (student) => student.id === this.classFormService.reservationModel().studentId,
      ) ?? null,
  );

  private subjectsLookupQuery = this.subjectService.getSubjectsLookupQuery();
  areSubjectsFetching = this.subjectsLookupQuery.isFetching;
  subjectsLookup = computed(() => this.subjectsLookupQuery.data());

  private updateClassReservationMutation = this.classService.updateClassReservationMutation;

  constructor() {
    effect(() => {
      const details = this.reservationDetails();
      if (!details) return;

      this.reservationModel.set(createClassReservationFormModel(details));
    });
  }

  onStudentSelected(student: StudentLookup | null) {
    this.classFormService.reservationForm.studentId().value.set(student?.id ?? '');
  }

  onSubmit() {
    return submit(this.reservationForm, async () => {
      const request = createUpdateClassReservationRequest(
        this.reservationId(),
        this.reservationModel(),
      );

      try {
        await this.updateClassReservationMutation.mutateAsync(request);
        this.toastService.showSuccess('Rezervacija je uspešno ažurirana.');
        this.router.navigateByUrl('/admin/classes');
      } catch (err) {
        const message = getClassReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }
}
