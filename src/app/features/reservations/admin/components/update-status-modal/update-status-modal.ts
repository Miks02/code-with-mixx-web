import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRight, faSolidArrowsRotate, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { DialogResult } from '../../../../../core/components/dialog/dialog';
import { DialogService } from '../../../../../core/services/dialog-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { Button } from '../../../../../shared/button/button';
import { createUpdateStatusForm } from '../../../factories/reservation-factories';
import { ReservationStatus } from '../../../models/reservation-status';
import { UpdateStatusFormModel } from '../../../models/update-status-request';
import { ReservationService } from '../../../services/reservation-service';

type ReservationStatusStyle = {
  label: string;
  dotClasses: string;
  selectedClasses: string;
};

const RESERVATION_STATUSES: Record<ReservationStatus, ReservationStatusStyle> = {
  [ReservationStatus.Confirmed]: {
    label: 'Potvrđena',
    dotClasses: 'bg-emerald-500',
    selectedClasses: 'bg-emerald-600 text-white',
  },
  [ReservationStatus.Completed]: {
    label: 'Završena',
    dotClasses: 'bg-sky-500',
    selectedClasses: 'bg-sky-700 text-white',
  },
  [ReservationStatus.Cancelled]: {
    label: 'Otkazana',
    dotClasses: 'bg-red-500',
    selectedClasses: 'bg-red-700 text-white',
  },
};

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidArrowRight,
      faSolidArrowsRotate,
      faSolidXmark,
    }),
  ],
  selector: 'app-update-status-modal',
  styleUrl: './update-status-modal.css',
  templateUrl: './update-status-modal.html',
})
export class UpdateStatusModal {
  private reservationService = inject(ReservationService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  reservationId = input.required<number>();
  currentStatus = input.required<ReservationStatus>();
  closed = output<void>();

  reservationStatuses = Object.values(ReservationStatus);
  reservationStatusStyles = RESERVATION_STATUSES;

  statusModel = linkedSignal<UpdateStatusFormModel>(() => ({
    reservationStatus: this.currentStatus(),
  }));
  statusForm = createUpdateStatusForm(this.statusModel, this.currentStatus);
  updateStatusMutation = this.reservationService.updateStatusMutation;

  selectedStatus = computed(() => this.statusModel().reservationStatus);
  isStatusChanged = computed(() => this.selectedStatus() !== this.currentStatus());

  onStatusSelected(reservationStatus: ReservationStatus) {
    this.statusModel.set({ reservationStatus });
    this.statusForm.reservationStatus().markAsTouched();
  }

  onClose() {
    this.closed.emit();
  }

  onSubmit() {
    return submit(this.statusForm, async () => {
      const currentLabel = this.reservationStatusStyles[this.currentStatus()].label;
      const selectedLabel = this.reservationStatusStyles[this.selectedStatus()].label;

      const result = await this.dialogService.showDialog({
        title: 'Promena statusa rezervacije',
        message: `Da li ste sigurni da želite da promenite status rezervacije iz „${currentLabel}” u „${selectedLabel}”?`,
      });

      if (result !== DialogResult.Confirmed) return;

      try {
        await this.updateStatusMutation.mutateAsync({
          reservationId: this.reservationId(),
          reservationStatus: this.selectedStatus(),
        });
        this.toastService.showSuccess(`Status rezervacije je promenjen u „${selectedLabel}”.`);
        this.closed.emit();

        return [];
      } catch (err: any) {
        
        if (err?.error?.errorCode === 'Reservation.NotFound') {
          this.toastService.showError(
            'Rezervacija nije pronadjena. Ako je u arhivi, vratite je iz arhive kako bi promenili status.',
          );
          return;
        }
        
        if (err?.error?.errorCode === 'Reservation.CantUpdateAnArchivedReservation') {
          this.toastService.showError('Nije moguće promeniti status arhivirane rezervacije.');
          return;
        }
       

        this.toastService.showError(
          'Došlo je do greške prilikom promene statusa. Pokušajte ponovo kasnije.',
        );
        return;
      }
    });
  }
}
