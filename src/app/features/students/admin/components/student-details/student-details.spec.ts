import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogResult } from '@core/components/dialog/dialog';
import { AccountStatus } from '@core/models/account-status';
import {
  createDialogServiceMock,
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { StudentItem } from '@features/students/models/student-item';
import {
  createStudent,
  flushStudentsSummary,
  STUDENTS_URL,
} from '@features/students/testing/student-test-utils';
import { StudentDetails } from './student-details';

describe('StudentDetails', () => {
  let fixture: ComponentFixture<StudentDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: ReturnType<typeof createDialogServiceMock>;

  const select = async (overrides: Partial<StudentItem> = {}) => {
    store.selectStudent(createStudent(overrides));
    await fixture.whenStable();
  };
  const buttonLabels = () =>
    Array.from(element.querySelectorAll('app-button')).map((button) => button.textContent?.trim());
  const inviteButton = () =>
    element.querySelector<HTMLButtonElement>('button[title="Pošalji pozivnicu"]');

  beforeEach(async () => {
    toast = createToastServiceMock();
    dialog = createDialogServiceMock();

    await TestBed.configureTestingModule({
      imports: [StudentDetails],
      providers: [
        AdminStudentStore,
        provideRouter([]),
        provideHttpTesting({ toastService: toast, dialogService: dialog }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminStudentStore);
    http = TestBed.inject(HttpTestingController);

    await flushStudentsSummary();
    await fixture.whenStable();
  });

  afterEach(async () => {
    await flushStudentsSummary();
    http.verify();
  });

  it('shows the placeholder when no student is selected', async () => {
    store.selectStudent(undefined);
    await fixture.whenStable();

    expect(element.textContent).toContain('Izaberi studenta iz liste da vidiš detalje');
    expect(buttonLabels()).toEqual([]);
  });

  describe('what is shown per account status', () => {
    it('active: name, status, contact data and all four actions', async () => {
      await select();

      expect(element.querySelector('h2')?.textContent).toContain('Marko Jovanović');
      expect(element.textContent).toContain('Aktivan');
      expect(element.textContent).toContain('marko.jovanovic@example.com');
      expect(element.textContent).toContain('+381601234567');
      expect(element.textContent).toContain('Elektrotehnički fakultet');
      expect(buttonLabels()).toEqual([
        'Detaljniji pregled',
        'Izmeni',
        'Deaktiviraj nalog',
        'Obriši',
      ]);
      expect(inviteButton()).toBeNull();
    });

    it('shows "Nije upisano" when the student has no university', async () => {
      await select({ university: null });
      expect(element.textContent).toContain('Nije upisano');
    });

    it('deactivated: offers activation instead of deactivation', async () => {
      await select({ accountStatus: AccountStatus.Deactivated });

      expect(element.textContent).toContain('Deaktiviran');
      expect(buttonLabels()).toContain('Aktiviraj nalog');
      expect(buttonLabels()).not.toContain('Deaktiviraj nalog');
    });

    it('pending: offers sending the invitation', async () => {
      await select({ accountStatus: AccountStatus.Pending });

      expect(element.textContent).toContain('Na čekanju');
      expect(inviteButton()).not.toBeNull();
    });

    it('deleted: hides the name and every action except the detailed view', async () => {
      await select({ accountStatus: AccountStatus.Deleted, deletedAt: '2026-03-01T08:00:00Z' });

      expect(element.querySelector('h2')?.textContent).toContain('Nalog obrisan');
      expect(element.textContent).not.toContain('Marko Jovanović');
      expect(buttonLabels()).toEqual(['Detaljniji pregled']);
      expect(inviteButton()).toBeNull();
    });
  });

  it('"Izmeni" opens the edit form for the selected student', async () => {
    await select();

    getButton(element, 'Izmeni')!.click();
    await fixture.whenStable();

    expect(store.isEditing()).toBe(true);
  });

  describe('deactivation and activation', () => {
    it('deactivates the account and offers activation afterwards', async () => {
      await select();

      getButton(element, 'Deaktiviraj nalog')!.click();
      await settle();

      const request = http.expectOne(`${STUDENTS_URL}/student-1/deactivate`);
      expect(request.request.method).toBe('POST');
      request.flush(null);
      await flushStudentsSummary();
      await fixture.whenStable();

      expect(toast.showSuccess).toHaveBeenCalledWith('Nalog je uspešno deaktiviran.');
      expect(store.selectedStudent()?.accountStatus).toBe(AccountStatus.Deactivated);
      expect(buttonLabels()).toContain('Aktiviraj nalog');
    });

    it('activates the account and offers deactivation afterwards', async () => {
      await select({ accountStatus: AccountStatus.Deactivated });

      getButton(element, 'Aktiviraj nalog')!.click();
      await settle();

      http.expectOne(`${STUDENTS_URL}/student-1/activate`).flush(null);
      await flushStudentsSummary();
      await fixture.whenStable();

      expect(toast.showSuccess).toHaveBeenCalledWith('Nalog je uspešno aktiviran.');
      expect(store.selectedStudent()?.accountStatus).toBe(AccountStatus.Active);
      expect(buttonLabels()).toContain('Deaktiviraj nalog');
    });

    it('shows a spinner overlay while the action is running', async () => {
      await select();

      getButton(element, 'Deaktiviraj nalog')!.click();
      // Not whenStable: it would wait for the pending mutation.
      await settle();
      fixture.detectChanges();
      expect(element.querySelector('ng-icon[name="faSolidSpinner"]')).not.toBeNull();

      http.expectOne(`${STUDENTS_URL}/student-1/deactivate`).flush(null);
      await flushStudentsSummary();
      await fixture.whenStable();
      expect(element.querySelector('ng-icon[name="faSolidSpinner"]')).toBeNull();
    });

    it('shows an info toast and keeps the status when the account is already deactivated', async () => {
      await select();

      getButton(element, 'Deaktiviraj nalog')!.click();
      await settle();
      http
        .expectOne(`${STUDENTS_URL}/student-1/deactivate`)
        .flush(createProblemDetails('User.AlreadyDeactivated'), {
          status: 409,
          statusText: 'Conflict',
        });
      await settle();

      expect(toast.showInfo).toHaveBeenCalledWith('Nalog je već deaktiviran.');
      expect(toast.showError).not.toHaveBeenCalled();
      expect(store.selectedStudent()?.accountStatus).toBe(AccountStatus.Active);
    });

    it('explains that a deleted account cannot change status', async () => {
      await select({ accountStatus: AccountStatus.Deactivated });

      getButton(element, 'Aktiviraj nalog')!.click();
      await settle();
      http
        .expectOne(`${STUDENTS_URL}/student-1/activate`)
        .flush(createProblemDetails('User.CannotChangeStatusForDeletedUser'), {
          status: 409,
          statusText: 'Conflict',
        });
      await settle();

      expect(toast.showInfo).toHaveBeenCalledWith(
        'Nalog je obrisan pa mu status ne može biti promenjen.',
      );
      expect(store.selectedStudent()?.accountStatus).toBe(AccountStatus.Deactivated);
    });
  });

  describe('invitation', () => {
    it('sends the invitation', async () => {
      await select({ accountStatus: AccountStatus.Pending });

      inviteButton()!.click();
      await settle();

      const request = http.expectOne(`${STUDENTS_URL}/student-1/invite`);
      expect(request.request.method).toBe('POST');
      request.flush(null);
      await settle();

      expect(toast.showSuccess).toHaveBeenCalledWith('Pozivnica je uspešno poslata.');
    });

    it('shows the domain error message when the invitation cannot be sent', async () => {
      await select({ accountStatus: AccountStatus.Pending });

      inviteButton()!.click();
      await settle();
      http
        .expectOne(`${STUDENTS_URL}/student-1/invite`)
        .flush(createProblemDetails('Auth.AccountDeactivated'), {
          status: 409,
          statusText: 'Conflict',
        });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Nalog izabranog studenta je deaktiviran. Slanje pozivnice nije moguće.',
      );
    });
  });

  describe('deletion', () => {
    it('warns that a student with reservations will not be fully deleted', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      await select({ totalReservations: 14 });

      getButton(element, 'Obriši')!.click();
      await settle();

      expect(dialog.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Izabrani student ima rezervacije i neće biti potpuno obrisan.',
        }),
      );
    });

    it('asks for a plain confirmation when the student has no reservations', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      await select({ totalReservations: 0 });

      getButton(element, 'Obriši')!.click();
      await settle();

      expect(dialog.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Da li sigurno želiš da obrišeš ovog studenta?' }),
      );
    });

    it('does not delete when the dialog is cancelled', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      await select();

      getButton(element, 'Obriši')!.click();
      await settle();

      http.expectNone(`${STUDENTS_URL}/student-1`);
      expect(store.selectedStudentId()).toBe('student-1');
    });

    it('deletes the student after confirmation and clears the selection', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await select();

      getButton(element, 'Obriši')!.click();
      await settle();

      const request = http.expectOne(`${STUDENTS_URL}/student-1`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
      await flushStudentsSummary();
      await fixture.whenStable();

      expect(toast.showSuccess).toHaveBeenCalledWith('Student je uspešno obrisan.');
      expect(store.selectedStudent()).toBeUndefined();
      expect(element.textContent).toContain('Izaberi studenta iz liste da vidiš detalje');
    });

    it('keeps the student selected when the deletion fails', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      await select();

      getButton(element, 'Obriši')!.click();
      await settle();
      http.expectOne(`${STUDENTS_URL}/student-1`).flush(createProblemDetails('Student.NotFound'), {
        status: 404,
        statusText: 'Not Found',
      });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith('Došlo je do greške. Student nije pronađen.');
      expect(toast.showSuccess).not.toHaveBeenCalled();
      expect(store.selectedStudentId()).toBe('student-1');
    });
  });
});
