import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBarsProgress,
  faSolidCircleCheck,
  faSolidDiagramProject,
  faSolidHourglassHalf,
} from '@ng-icons/font-awesome/solid';
import { DialogResult } from '../../../../../core/components/dialog/dialog';
import { DialogService } from '../../../../../core/services/dialog-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { StatsCard } from '../../../../../shared/stats-card/stats-card';
import { PaymentStatus, ReservationStatus } from '../../../../reservations';
import { SubjectService } from '../../../../subjects';
import { ProjectReservationsList } from '../../../components/project-reservations-list/project-reservations-list';
import { ProjectQueryParams } from '../../../models/project-query-params';
import { ProjectReservationItem } from '../../../models/project-reservation-item';
import { ProjectType } from '../../../models/project-type';
import { ProjectService } from '../../../services/project-service';
import { ProjectReservationDetails } from '../../components/project-reservation-details/project-reservation-details';

@Component({
  imports: [ProjectReservationsList, ProjectReservationDetails, StatsCard],
  providers: [
    provideIcons({
      faSolidBarsProgress,
      faSolidCircleCheck,
      faSolidDiagramProject,
      faSolidHourglassHalf,
    }),
  ],
  selector: 'app-projects-page',
  styleUrl: './projects-page.css',
  templateUrl: './projects-page.html',
})
export class ProjectsPage {
  private projectService = inject(ProjectService);
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);

  protected queryParams = signal<ProjectQueryParams>({
    pageNumber: 1,
    pageSize: 15,
    subjectIds: [],
    projectTypes: [],
    paymentStatuses: [],
    reservationStatuses: [],
    showOnlyDeletedReservations: false,
    showOnlyDeletedStudents: false,
  });

  private projectsSummarySource = this.projectService.getProjectsSummaryQuery(this.queryParams);
  private reservationsSource = this.projectService.getPagedProjectReservationsQuery(
    this.queryParams,
    this.projectsSummarySource,
  );

  private subjectsLookupSource = this.subjectService.getSubjectsLookupQuery();

  subjectsLookupData = computed(() => this.subjectsLookupSource.data() ?? []);
  projectsSummaryData = computed(() => this.projectsSummarySource.data());
  reservationsData = computed(() => this.reservationsSource.data());
  
  projectsSummaryPending = computed(() => this.projectsSummarySource.isPending());
  reservationsPending = computed(() => this.reservationsSource.isPending());
  reservationsFetching = computed(() => this.reservationsSource.isFetching());
  isArchiving = computed(
    () =>
      this.projectService.archiveProjectReservationMutation.isPending() ||
      this.projectService.restoreProjectReservationMutation.isPending() ||
      this.projectService.deleteProjectReservationMutation.isPending(),
  );

  selectedReservation = linkedSignal<ProjectReservationItem[], ProjectReservationItem | undefined>({
    source: () => this.reservationsData()?.items ?? [],
    computation: (options, previous) =>
      options.find((o) => o.id === previous?.value?.id) ?? options[0],
  });

  onReservationSelected(reservation: ProjectReservationItem | undefined) {
    this.selectedReservation.set(reservation);
  }

  async onArchiveReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Arhiviranje rezervacije',
      message: `Da li ste sigurni da želite da arhivirate rezervaciju studenta „${this.selectedReservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.archiveProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(
          'Rezervacija je uspešno arhivirana.',
        ),
      onError: () =>
        this.toastService.showError(
          'Došlo je do greške prilikom arhiviranja rezervacije. Pokušajte ponovo kasnije.',
        ),
    });
  }

  async onRestoreReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Vraćanje rezervacije',
      message: `Da li ste sigurni da želite da vratite rezervaciju studenta „${this.selectedReservation()?.studentFullName}” iz arhive?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.restoreProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(
          'Rezervacija je uspešno vraćena iz arhive.',
        ),
      onError: () =>
        this.toastService.showError(
          'Došlo je do greške prilikom vraćanja rezervacije. Pokušajte ponovo kasnije.',
        ),
    });
  }

  async onDeleteReservation(reservationId: number) {
    const result = await this.dialogService.showDialog({
      title: 'Brisanje rezervacije',
      message: `Da li ste sigurni da želite da obrišete rezervaciju studenta „${this.selectedReservation()?.studentFullName}”?`,
    });

    if (result !== DialogResult.Confirmed) return;

    this.projectService.deleteProjectReservationMutation.mutate(reservationId, {
      onSuccess: () =>
        this.toastService.showSuccess(
          'Rezervacija je uspešno obrisana.',
        ),
      onError: (err: any) => {
        if (err?.error?.errorCode === "Reservation.RequiresHistoryRetention") {
          this.toastService.showError(
            'Rezervacija ne može biti trajno obrisana jer zahteva čuvanje istorije.',
          )
          return;
        }
        this.toastService.showError(
          'Došlo je do greške prilikom brisanja rezervacije. Pokušajte ponovo kasnije.',
        )
      }
    });
  }

  onSubjectIdsChange(subjectIds: number[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, subjectIds }));
  }

  onProjectTypesChange(projectTypes: ProjectType[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, projectTypes }));
  }

  onReservationStatusesChange(reservationStatuses: ReservationStatus[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, reservationStatuses }));
  }

  onPaymentStatusesChange(paymentStatuses: PaymentStatus[]) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, paymentStatuses }));
  }

  onDeletedReservationsToggle(showOnlyDeletedReservations: boolean) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, showOnlyDeletedReservations }));
  }

  onDeletedStudentsToggle(showOnlyDeletedStudents: boolean) {
    this.queryParams.update((params) => ({ ...params, pageNumber: 1, showOnlyDeletedStudents }));
  }

  onPageChange(pageNumber: number) {
    this.queryParams.update((params) => ({ ...params, pageNumber }));
  }


}
