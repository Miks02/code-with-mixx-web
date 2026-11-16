import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
  typeInto,
  wait,
} from '@core/testing/test-utils';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import {
  createStudent,
  flushStudentsSummary,
  STUDENTS_URL,
} from '@features/students/testing/student-test-utils';
import { EditStudentForm } from './edit-student-form';

describe('EditStudentForm', () => {
  let fixture: ComponentFixture<EditStudentForm>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;

  const input = (field: string) => element.querySelector<HTMLInputElement>(`#edit-${field}`)!;
  const type = async (field: string, value: string) => {
    typeInto(input(field), value);
    // The email field is debounced by 100 ms.
    await wait(150);
    await fixture.whenStable();
  };
  const save = async () => {
    getButton(element, 'Sačuvaj izmene')!.click();
    await settle();
  };

  beforeEach(async () => {
    toast = createToastServiceMock();

    await TestBed.configureTestingModule({
      imports: [EditStudentForm],
      providers: [AdminStudentStore, provideHttpTesting({ toastService: toast })],
    }).compileComponents();

    store = TestBed.inject(AdminStudentStore);
    http = TestBed.inject(HttpTestingController);
    await flushStudentsSummary();

    store.selectStudent(createStudent());
    store.startEditing();

    fixture = TestBed.createComponent(EditStudentForm);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(async () => {
    await flushStudentsSummary();
    http.verify();
  });

  it('is prefilled with the selected student', () => {
    expect(input('firstName').value).toBe('Marko');
    expect(input('lastName').value).toBe('Jovanović');
    expect(input('email').value).toBe('marko.jovanovic@example.com');
    expect(input('phoneNumber').value).toBe('+381601234567');
    expect(input('university').value).toBe('Elektrotehnički fakultet');
  });

  it('closes the form on "Otkaži" without saving', async () => {
    await type('firstName', 'Petar');

    getButton(element, 'Otkaži')!.click();
    await settle();

    expect(store.isEditing()).toBe(false);
    expect(store.selectedStudent()?.firstName).toBe('Marko');
  });

  it('saves the changes, updates the selected student and closes the form', async () => {
    await type('firstName', 'Marko Petar');
    await type('email', 'marko.petar@example.com');
    await save();

    const request = http.expectOne(`${STUDENTS_URL}/student-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      id: 'student-1',
      firstName: 'Marko Petar',
      lastName: 'Jovanović',
      email: 'marko.petar@example.com',
      phoneNumber: '+381601234567',
      university: 'Elektrotehnički fakultet',
    });
    request.flush({
      id: 'student-1',
      firstName: 'Marko Petar',
      lastName: 'Jovanović',
      email: 'marko.petar@example.com',
      phoneNumber: '+381601234567',
      university: 'Elektrotehnički fakultet',
      registeredAt: '2025-09-15T10:24:00Z',
      accountStatus: 'Active',
    });
    await flushStudentsSummary();

    expect(toast.showSuccess).toHaveBeenCalledWith('Podaci studenta su uspešno izmenjeni.');
    expect(store.isEditing()).toBe(false);
    expect(store.selectedStudent()).toEqual(
      createStudent({ firstName: 'Marko Petar', email: 'marko.petar@example.com' }),
    );
  });

  it('sends null when the university is cleared', async () => {
    await type('university', '   ');
    await save();

    const request = http.expectOne(`${STUDENTS_URL}/student-1`);
    expect(request.request.body.university).toBeNull();
    request.flush(createStudent({ university: null }));
    await flushStudentsSummary();

    expect(store.selectedStudent()?.university).toBeNull();
  });

  it('does not save and shows the validation messages for missing or invalid fields', async () => {
    await type('firstName', '');
    await type('email', 'nije-email');
    await save();
    await fixture.whenStable();

    http.expectNone(`${STUDENTS_URL}/student-1`);
    expect(element.textContent).toContain('Ime je obavezno.');
    expect(element.textContent).toContain('Email adresa nije validna.');
    expect(store.isEditing()).toBe(true);
  });

  it('shows the taken email error on the email field and stays open', async () => {
    await type('email', 'jelena.petrovic@example.com');
    await save();

    http
      .expectOne(`${STUDENTS_URL}/student-1`)
      .flush(createProblemDetails('User.EmailAlreadyExists'), {
        status: 409,
        statusText: 'Conflict',
      });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Korisnik sa ovom email adresom već postoji.');
    expect(toast.showError).not.toHaveBeenCalled();
    expect(store.isEditing()).toBe(true);
    expect(store.selectedStudent()?.email).toBe('marko.jovanovic@example.com');
  });

  it('disables both buttons while the changes are being saved', async () => {
    await type('firstName', 'Marko Petar');
    await save();
    // Not whenStable: it would wait for the pending mutation.
    fixture.detectChanges();

    expect(getButton(element, 'Sačuvaj izmene')!.disabled).toBe(true);
    expect(getButton(element, 'Otkaži')!.disabled).toBe(true);

    http.expectOne(`${STUDENTS_URL}/student-1`).flush(createStudent({ firstName: 'Marko Petar' }));
    await flushStudentsSummary();
  });
});
