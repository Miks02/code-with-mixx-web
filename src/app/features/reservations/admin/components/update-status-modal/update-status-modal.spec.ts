import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
import { ToastService } from '@core/services/toast-service';
import { ReservationStatus } from '@features/reservations/models/reservation-status';
import { ReservationService } from '@features/reservations/services/reservation-service';
import { UpdateStatusModal } from './update-status-modal';

describe('UpdateStatusModal', () => {
  let component: UpdateStatusModal;
  let fixture: ComponentFixture<UpdateStatusModal>;

  const updateStatusMutation = {
    mutateAsync: vi.fn(),
    isPending: signal(false),
  };
  const toastService = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };
  const dialogService = {
    showDialog: vi.fn(),
  };

  function setStatus(reservationStatus: ReservationStatus) {
    component.onStatusSelected(reservationStatus);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [UpdateStatusModal],
      providers: [
        { provide: ReservationService, useValue: { updateStatusMutation } },
        { provide: ToastService, useValue: toastService },
        { provide: DialogService, useValue: dialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateStatusModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reservationId', 7);
    fixture.componentRef.setInput('currentStatus', ReservationStatus.Confirmed);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should preselect the current status', () => {
      expect(component.selectedStatus()).toBe(ReservationStatus.Confirmed);
      expect(component.isStatusChanged()).toBe(false);
    });

    it('should not show the new status before a different one is selected', () => {
      expect(fixture.nativeElement.textContent).not.toContain('Novi status');
    });
  });

  describe('status selection', () => {
    it('should update the model and mark field as touched', () => {
      setStatus(ReservationStatus.Completed);

      expect(component.statusModel().reservationStatus).toBe(ReservationStatus.Completed);
      expect(component.statusForm.reservationStatus().touched()).toBe(true);
      expect(component.isStatusChanged()).toBe(true);
    });

    it('should show the new status label when status is changed', () => {
      setStatus(ReservationStatus.Cancelled);

      expect(fixture.nativeElement.textContent).toContain('Novi status');
      expect(fixture.nativeElement.textContent).toContain('Otkazana');
    });
  });

  describe('validation', () => {
    it('should not allow the same status as the current one', () => {
      setStatus(ReservationStatus.Confirmed);

      expect(component.statusForm.reservationStatus().errors()[0]?.message).toBe(
        'Izabrani status je isti kao trenutni.',
      );
      expect(fixture.nativeElement.textContent).toContain('Izabrani status je isti kao trenutni.');
    });

    it('should be valid when a different status is selected', () => {
      setStatus(ReservationStatus.Completed);

      expect(component.statusForm().valid()).toBe(true);
    });
  });

  it('should emit closed on close', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onClose();

    expect(closedSpy).toHaveBeenCalledOnce();
  });

  describe('onSubmit', () => {
    let closedSpy: ReturnType<typeof vi.fn<() => void>>;

    beforeEach(() => {
      closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);
    });

    it('should not open dialog or call mutation when status is unchanged', async () => {
      await component.onSubmit();

      expect(dialogService.showDialog).not.toHaveBeenCalled();
      expect(updateStatusMutation.mutateAsync).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should ask for confirmation with current and new status labels', async () => {
      dialogService.showDialog.mockResolvedValue(DialogResult.Cancelled);
      setStatus(ReservationStatus.Completed);

      await component.onSubmit();

      expect(dialogService.showDialog).toHaveBeenCalledWith({
        title: 'Promena statusa rezervacije',
        message:
          'Da li ste sigurni da želite da promenite status rezervacije iz „Potvrđena” u „Završena”?',
      });
    });

    it('should not call mutation when dialog is cancelled', async () => {
      dialogService.showDialog.mockResolvedValue(DialogResult.Cancelled);
      setStatus(ReservationStatus.Completed);

      await component.onSubmit();

      expect(updateStatusMutation.mutateAsync).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should update status, show success toast and close when confirmed', async () => {
      dialogService.showDialog.mockResolvedValue(DialogResult.Confirmed);
      updateStatusMutation.mutateAsync.mockResolvedValue(undefined);
      setStatus(ReservationStatus.Cancelled);

      await component.onSubmit();

      expect(updateStatusMutation.mutateAsync).toHaveBeenCalledWith({
        reservationId: 7,
        reservationStatus: ReservationStatus.Cancelled,
      });
      expect(toastService.showSuccess).toHaveBeenCalledWith(
        'Status rezervacije je promenjen u „Otkazana”.',
      );
      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should show archived error toast and stay open when reservation is archived', async () => {
      dialogService.showDialog.mockResolvedValue(DialogResult.Confirmed);
      updateStatusMutation.mutateAsync.mockRejectedValue({
        status: 409,
        errorCode: 'Reservation.CantUpdateAnArchivedReservation',
      });
      setStatus(ReservationStatus.Completed);

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalledWith(
        'Nije moguće promeniti status arhivirane rezervacije.',
      );
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should show generic error toast and stay open on unknown error', async () => {
      dialogService.showDialog.mockResolvedValue(DialogResult.Confirmed);
      updateStatusMutation.mutateAsync.mockRejectedValue(new Error('fail'));
      setStatus(ReservationStatus.Completed);

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalledWith(
        'Došlo je do greške prilikom promene statusa. Pokušajte ponovo kasnije.',
      );
      expect(closedSpy).not.toHaveBeenCalled();
    });
  });
});
