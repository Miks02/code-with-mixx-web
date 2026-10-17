import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { ProjectReservationRequest } from '../../../models/project-reservation-request';
import { submit } from '@angular/forms/signals';
import { ToastService } from '../../../../../core/services/toast-service';
import { UpdateProjectReservationRequest } from '../../../models/update-project-reservation-request';

const SERVER_ERROR_MESSAGES: Record<string, string> = {
  'Student.NotFound': 'Izabrani student više ne postoji. Osvežite stranicu i izaberite drugog.',
  'Subject.MultipleSubjectsMissing':
    'Neki od izabranih predmeta više ne postoje. Osvežite stranicu i izaberite ponovo.',
  'Reservation.NoProjectsProvided': 'Rezervacija mora imati barem jedan projekat.',
  'Reservation.InvalidTotalPrice': 'Ukupna cena ne može biti negativna.',
  'Reservation.InvalidAmount': 'Plaćeni iznos ne može biti negativan.',
  'Project.NegativePrice': 'Cena projekta ne može biti negativna.',
  'Project.InvalidProgress': 'Napredak projekta mora biti između 0 i 100.',
  'Project.InvalidDateRange': 'Početak projekta ne može biti posle roka.',
  'Project.InvalidReservationDate': 'Datum rezervacije ne može biti u budućnosti.',
  'Project.GithubLinkIsTooLong': 'Github link ne može imati više od 200 karaktera.',
  'Project.DownloadLinkIsTooLong': 'Download link ne može imati više od 200 karaktera.',
  'Project.EmptyProjectNote': 'Beleške ne mogu biti prazne.',
};

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
      const model = this.reservationModel();
      const request: UpdateProjectReservationRequest = {
        id: model.id,
        studentId: model.studentId,
        paidAmount: model.paidAmount,
        totalPrice: model.totalPrice,
        reservationStatus: model.reservationStatus,
        projectsToDelete: model.projectsToDelete,
        projects: model.projects.map((project) => ({
          ...project,
          startDate: project.startDate,
          endDate: project.endDate,
          reservedAt: project.reservedAt,
          githubLink: project.githubLink || null,
          downloadLink: project.downloadLink || null,
          notes: project.notes,
        })),
      };

      try {
        await this.updateProjectReservationMutation.mutateAsync(request);
        this.toastService.showSuccess('Rezervacija je uspešno ažurirana.');
        this.router.navigateByUrl('/admin/projects');
      } catch (err: any) {
        if (err?.status === 400 && err?.error?.errors) {
          this.toastService.showError('Podaci rezervacije nisu ispravni. Proverite polja forme.');
          return;
        }
        this.toastService.showError(
          SERVER_ERROR_MESSAGES[err?.error?.errorCode] ??
            'Došlo je do greške prilikom ažuriranja rezervacije. Pokušajte ponovo kasnije.',
        );
      }
    });
  }
}
