import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DialogResult } from '@core/components/dialog/dialog';
import {
  createDialogServiceMock,
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { priceConverter } from '@core/utilities/price-helpers';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import { ProjectReservationItem } from '@features/projects/models/project-reservation-item';
import {
  createPagedProjectReservations,
  createProjectListItem,
  createProjectReservation,
  createProjectsSummary,
  flushProjectsSummary,
  PROJECT_RESERVATIONS_URL,
  RESERVATIONS_URL,
} from '@features/projects/testing/project-test-utils';
import { ProjectReservationDetails } from './project-reservation-details';

describe('ProjectReservationDetails', () => {
  let fixture: ComponentFixture<ProjectReservationDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminProjectStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: ReturnType<typeof createDialogServiceMock>;

  const load = async (overrides: Partial<ProjectReservationItem> = {}) => {
    const reservation = createProjectReservation(overrides);
    await flushProjectsSummary(
      createProjectsSummary({ reservations: createPagedProjectReservations([reservation]) }),
    );
    await fixture.whenStable();
    return reservation;
  };
  const buttonLabels = () =>
    Array.from(element.querySelectorAll('app-button')).map((button) => button.textContent?.trim());
  const stat = (label: string) =>
    Array.from(element.querySelectorAll('span.text-xs'))
      .find((span) => span.textContent?.trim() === label)
      ?.previousElementSibling?.textContent?.trim();
  const conflict = (errorCode: string) =>
    [createProblemDetails(errorCode), { status: 409, statusText: 'Conflict' }] as const;

  beforeEach(async () => {
    toast = createToastServiceMock();
    dialog = createDialogServiceMock();

    await TestBed.configureTestingModule({
      imports: [ProjectReservationDetails],
      providers: [
        AdminProjectStore,
        provideRouter([]),
        provideHttpTesting({ toastService: toast, dialogService: dialog }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminProjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushProjectsSummary();
    http.verify();
  });

  it('shows the placeholder when no reservation is selected', async () => {
    await flushProjectsSummary(
      createProjectsSummary({ reservations: createPagedProjectReservations([]) }),
    );
    await fixture.whenStable();

    expect(element.textContent).toContain('Izaberi rezervaciju iz liste da vidiš detalje');
    expect(buttonLabels()).toEqual([]);
  });

  describe('what is shown', () => {
    it('the remaining amount is the price minus what was paid', async () => {
      await load({ totalPrice: 10000, paidAmount: 4000, discountRate: 10, bonus: 500 });

      expect(stat('Ukupna cena')).toBe(priceConverter(10000));
      expect(stat('Plaćeno')).toBe(priceConverter(4000));
      expect(stat('Preostalo')).toBe(priceConverter(6000));
      expect(stat('Popust')).toBe('10%');
      expect(stat('Bonus')).toBe(priceConverter(500));
    });

    it('never shows a negative remaining amount when the student paid more', async () => {
      await load({ totalPrice: 10000, paidAmount: 12000 });
      expect(stat('Preostalo')).toBe(priceConverter(0));
    });

    it('an active reservation can be archived, paid, have its status changed and opened', async () => {
      await load();

      expect(buttonLabels()).toEqual([
        'Pregled uplata',
        'Arhiviraj rezervaciju',
        'Promeni status',
        'Registruj uplatu',
        'Skini uplatu',
        'Detalji rezervacije',
      ]);
    });

    it('an archived reservation can only be restored and its payments viewed', async () => {
      await load({ deletedAt: '2026-11-01T10:00:00Z' });

      expect(element.textContent).toContain('Arhivirano:');
      expect(buttonLabels()).toEqual(['Pregled uplata', 'Vrati iz arhive']);
    });

    it('offers hard deletion only when the backend allows it', async () => {
      await load({ isHardDeletable: true });
      expect(buttonLabels()).toContain('Obriši rezervaciju');
    });
  });

  describe('archiving and restoring', () => {
    it('archives after confirmation, naming the student in the dialog', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();

      expect(dialog.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Marko Jovanović') }),
      );
      const request = http.expectOne(`${PROJECT_RESERVATIONS_URL}/1/archive`);
      expect(request.request.method).toBe('POST');
      request.flush(null);
      await flushProjectsSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno arhivirana.');
    });

    it('does nothing when the dialog is cancelled', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();

      http.expectNone(`${PROJECT_RESERVATIONS_URL}/1/archive`);
    });

    it('restores an archived reservation', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load({ deletedAt: '2026-11-01T10:00:00Z' });

      getButton(element, 'Vrati iz arhive')!.click();
      await settle();

      http.expectOne(`${PROJECT_RESERVATIONS_URL}/1/restore`).flush(null);
      await flushProjectsSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno vraćena iz arhive.');
    });

    it('shows the domain error when the reservation no longer exists', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();
      http
        .expectOne(`${PROJECT_RESERVATIONS_URL}/1/archive`)
        .flush(...conflict('Reservation.NotFound'));
      await settle();

      expect(toast.showError).toHaveBeenCalledWith('Rezervacija više ne postoji. Osveži stranicu.');
      expect(toast.showSuccess).not.toHaveBeenCalled();
    });

    it('shows loading on the action buttons while the request is running', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();
      fixture.detectChanges();
      expect(getButton(element, 'Arhiviraj rezervaciju')!.disabled).toBe(true);

      http.expectOne(`${PROJECT_RESERVATIONS_URL}/1/archive`).flush(null);
      await flushProjectsSummary();
    });
  });

  describe('deleting', () => {
    beforeEach(() => dialog.showDialog.mockResolvedValue(DialogResult.Confirmed));

    it('deletes through the shared reservations endpoint', async () => {
      await load({ isHardDeletable: true });

      getButton(element, 'Obriši rezervaciju')!.click();
      await settle();

      const request = http.expectOne(`${RESERVATIONS_URL}/1`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
      await flushProjectsSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno obrisana.');
    });

    it('explains why a reservation that needs its history cannot be deleted', async () => {
      await load({ isHardDeletable: true });

      getButton(element, 'Obriši rezervaciju')!.click();
      await settle();
      http
        .expectOne(`${RESERVATIONS_URL}/1`)
        .flush(...conflict('Reservation.RequiresHistoryRetention'));
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Rezervacija ne može biti trajno obrisana jer zahteva čuvanje istorije.',
      );
    });
  });

  describe('modals', () => {
    it.each([
      ['Registruj uplatu', 'app-register-payment-modal'],
      ['Skini uplatu', 'app-subtract-payment-modal'],
      ['Promeni status', 'app-update-status-modal'],
    ])('"%s" opens its modal', async (label, selector) => {
      await load();

      getButton(element, label)!.click();
      await fixture.whenStable();

      expect(element.querySelector(selector)).not.toBeNull();
    });

    it('"Pregled uplata" opens the history and loads the payments of this reservation', async () => {
      await load();

      getButton(element, 'Pregled uplata')!.click();
      await settle();
      http.expectOne((req) => req.url.endsWith('/reservations/1/payments')).flush({ payments: [] });
      await fixture.whenStable();

      expect(element.querySelector('app-reservation-payment-history-modal')).not.toBeNull();
    });

    it('clicking a project opens it in the edit modal', async () => {
      await load({
        projects: [
          createProjectListItem({ id: 10 }),
          createProjectListItem({ id: 11, name: 'Web prodavnica' }),
        ],
      });

      element.querySelector<HTMLElement>('[aria-label="Detalji projekta Web prodavnica"]')!.click();
      await settle();

      expect(store.editedProjectId()).toBe(11);
      http.expectOne(`${PROJECT_RESERVATIONS_URL}/items/11`).flush(null);
      await fixture.whenStable();
      expect(element.querySelector('app-project-edit-modal')).not.toBeNull();
    });
  });

  it('"Detalji rezervacije" opens the reservation page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await load();

    getButton(element, 'Detalji rezervacije')!.click();

    expect(navigate).toHaveBeenCalledWith(['admin/projects/details/1']);
  });
});
