import { Component, computed, inject } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { Button } from '@shared/components/button/button';
import { StudentLookup, StudentSelection, StudentService } from '@features/students';
import { SubjectService } from '@features/subjects';
import { createClassReservationRequest } from '@features/classes/factories/class-factories';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationPricing } from '@features/classes/admin/components/class-reservation-pricing/class-reservation-pricing';
import { ClassReservationSummary } from '@features/classes/admin/components/class-reservation-summary/class-reservation-summary';

@Component({
  imports: [RouterLink, Button, StudentSelection, ClassReservationPricing, ClassReservationSummary],
  providers: [ClassFormService],
  selector: 'app-create-class-reservation-page',
  styleUrl: './create-class-reservation-page.css',
  templateUrl: './create-class-reservation-page.html',
})
export class CreateClassReservationPage {
  studentService = inject(StudentService);
  subjectService = inject(SubjectService);
  classFormService = inject(ClassFormService);
  toastService = inject(ToastService);
  router = inject(Router);

  reservationModel = this.classFormService.reservationModel;
  reservationForm = this.classFormService.reservationForm;

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

  onStudentSelected(student: StudentLookup | null) {
    this.classFormService.reservationForm.studentId().value.set(student?.id ?? '');
  }

  onSubmit() {
    return submit(this.reservationForm, async () => {
      const request = createClassReservationRequest(this.reservationModel());

      // TODO: call createClassReservationMutation once it exists in ClassService
      // and handle errors with getClassReservationErrorMessage
      void request;
      this.toastService.showSuccess('Rezervacija je uspešno kreirana.');
      this.router.navigateByUrl('/admin/classes');
    });
  }
}
