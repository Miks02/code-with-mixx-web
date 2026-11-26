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
import { AdminClassStore } from '@features/classes/admin/stores/admin-class-store';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import {
  CLASS_RESERVATIONS_URL,
  createClassesSummary,
  createClassItem,
  createClassReservation,
  createPagedClassReservations,
  flushClassesSummary,
  RESERVATIONS_URL,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationDetails } from './class-reservation-details';

describe('ClassReservationDetails', () => {
  let fixture: ComponentFixture<ClassReservationDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminClassStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: ReturnType<typeof createDialogServiceMock>;

  const load = async (overrides: Partial<ClassReservationItem> = {}) => {
    const reservation = createClassReservation(overrides);
    await flushClassesSummary(
      createClassesSummary({ reservations: createPagedClassReservations([reservation]) }),
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
      imports: [ClassReservationDetails],
      providers: [
        AdminClassStore,
        provideRouter([]),
        provideHttpTesting({ toastService: toast, dialogService: dialog }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminClassStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushClassesSummary();
    http.verify();
  });

  it('shows the placeholder when no reservation is selected', async () => {
    await flushClassesSummary(
      createClassesSummary({ reservations: createPagedClassReservations([]) }),
    );
    await fixture.whenStable();

    expect(element.textContent).toContain('Izaberi rezervaciju iz liste da vidiš detalje');
    expect(buttonLabels()).toEqual([]);
  });

  describe('what is shown', () => {
    it('the remaining amount is the price minus what was paid', async () => {
      await load({ totalPrice: 2600, paidAmount: 1000, discountRate: 10, bonus: 300 });

      expect(stat('Ukupna cena')).toBe(priceConverter(2600));
      expect(stat('Plaćeno')).toBe(priceConverter(1000));
      expect(stat('Preostalo')).toBe(priceConverter(1600));
      expect(stat('Popust')).toBe('10%');
      expect(stat('Bonus')).toBe(priceConverter(300));
    });

    it('never shows a negative remaining amount when the student paid more', async () => {
      await load({ totalPrice: 2600, paidAmount: 4000 });
      expect(stat('Preostalo')).toBe(priceConverter(0));
    });

    it('lists every class of the reservation', async () => {
      await load({
        classes: [
          createClassItem({ id: 1 }),
          createClassItem({ id: 2, subjectName: 'Web programiranje' }),
        ],
      });

      expect(element.textContent).toContain('Časovi (2)');
      expect(element.querySelectorAll('app-class-card').length).toBe(2);
    });

    it('shows an empty state for a reservation without classes', async () => {
      await load({ classes: [] });

      expect(element.textContent).toContain('Časovi (0)');
      expect(element.textContent).toContain('Nema časova za prikaz.');
    });

    it('shows the description only when there is one', async () => {
      await load({ description: null });
      expect(element.textContent).not.toContain('Opis');
    });

    it('an active reservation can be archived, paid, have its status changed and opened', async () => {
      await load();

      expect(buttonLabels()).toEqual([
        'Pregled uplata',
        'Arhiviraj rezervaciju',
        'Promeni status',
        'Registruj uplatu',
        'Skini uplatu',
        'Ažuriraj rezervaciju',
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
      const request = http.expectOne(`${CLASS_RESERVATIONS_URL}/1/archive`);
      expect(request.request.method).toBe('POST');
      request.flush(null);
      await flushClassesSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno arhivirana.');
    });

    it('does nothing when the dialog is cancelled', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();

      http.expectNone(`${CLASS_RESERVATIONS_URL}/1/archive`);
    });

    it('restores an archived reservation', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load({ deletedAt: '2026-11-01T10:00:00Z' });

      getButton(element, 'Vrati iz arhive')!.click();
      await settle();

      http.expectOne(`${CLASS_RESERVATIONS_URL}/1/restore`).flush(null);
      await flushClassesSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno vraćena iz arhive.');
    });

    it.each([
      ['Arhiviraj rezervaciju', {}, 'archive', 'Reservation.AlreadyDeleted'],
      [
        'Vrati iz arhive',
        { deletedAt: '2026-11-01T10:00:00Z' },
        'restore',
        'Reservation.NotArchived',
      ],
    ])(
      '"%s" explains a stale state with its domain error',
      async (label, overrides, action, errorCode) => {
        dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
        await load(overrides);

        getButton(element, label)!.click();
        await settle();
        http.expectOne(`${CLASS_RESERVATIONS_URL}/1/${action}`).flush(...conflict(errorCode));
        await settle();

        expect(toast.showError).toHaveBeenCalledTimes(1);
        expect(toast.showError.mock.calls[0][0]).toContain('Osveži stranicu');
        expect(toast.showSuccess).not.toHaveBeenCalled();
      },
    );

    it('does not show a second toast for an error the interceptor already handles', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();
      http
        .expectOne(`${CLASS_RESERVATIONS_URL}/1/archive`)
        .flush(createProblemDetails('General.InternalServerError', { status: 500 }), {
          status: 500,
          statusText: 'Internal Server Error',
        });
      await settle();

      expect(toast.showError).toHaveBeenCalledTimes(1);
    });

    it('shows loading on the action buttons while the request is running', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await load();

      getButton(element, 'Arhiviraj rezervaciju')!.click();
      await settle();
      fixture.detectChanges();
      expect(getButton(element, 'Arhiviraj rezervaciju')!.disabled).toBe(true);

      http.expectOne(`${CLASS_RESERVATIONS_URL}/1/archive`).flush(null);
      await flushClassesSummary();
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
      await flushClassesSummary();

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
      expect(store.reservationModal()).not.toBeNull();
    });

    it('"Pregled uplata" opens the history and loads the payments of this reservation', async () => {
      await load();

      getButton(element, 'Pregled uplata')!.click();
      await settle();
      http.expectOne((req) => req.url.endsWith('/reservations/1/payments')).flush({ payments: [] });
      await fixture.whenStable();

      expect(element.querySelector('app-reservation-payment-history-modal')).not.toBeNull();
    });
  });

  it('"Ažuriraj rezervaciju" opens the update page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await load();

    getButton(element, 'Ažuriraj rezervaciju')!.click();

    expect(navigate).toHaveBeenCalledWith(['admin/classes/update/1']);
  });
});
