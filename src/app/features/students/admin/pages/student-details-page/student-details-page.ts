import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidChalkboardUser,
  faSolidDiagramProject,
  faSolidTriangleExclamation,
  faSolidUserXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { StudentDetailsQueryParams } from '@features/students/models/student-details';
import { StudentService } from '@features/students/services/student-service';
import { StudentProfile } from '@features/students/admin/components/student-profile/student-profile';
import {
  ReservationTypeFilter,
  StudentReservationsList,
} from '@features/students/admin/components/student-reservations-list/student-reservations-list';

@Component({
  imports: [RouterLink, NgIcon, Button, StatsCard, StudentProfile, StudentReservationsList],
  providers: [
    provideIcons({
      faSolidCalendarCheck,
      faSolidChalkboardUser,
      faSolidDiagramProject,
      faSolidTriangleExclamation,
      faSolidUserXmark,
    }),
  ],
  selector: 'app-student-details-page',
  styleUrl: './student-details-page.css',
  templateUrl: './student-details-page.html',
})
export class StudentDetailsPage {
  private studentService = inject(StudentService);
  private activatedRoute = inject(ActivatedRoute);

  studentId = signal(this.activatedRoute.snapshot.paramMap.get('id') ?? '');

  protected queryParams = signal<StudentDetailsQueryParams>({
    pageNumber: 1,
    pageSize: 10,
    reservationType: null,
  });

  private detailsQuery = this.studentService.getStudentDetailsQuery(
    this.studentId,
    this.queryParams,
  );

  details = computed(() => this.detailsQuery.data());
  student = computed(() => this.details()?.student);
  stats = computed(() => this.details()?.stats);
  reservations = computed(() => this.details()?.reservations);

  isPending = computed(() => this.detailsQuery.isPending());
  isFetching = computed(() => this.detailsQuery.isFetching());
  isNotFound = computed(() => this.detailsQuery.error()?.errorCode === 'Student.NotFound');

  selectedType = computed<ReservationTypeFilter>(() => this.queryParams().reservationType ?? 'All');

  onTypeChange(type: ReservationTypeFilter) {
    this.queryParams.update((params) => ({
      ...params,
      pageNumber: 1,
      reservationType: type === 'All' ? null : type,
    }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }
}
