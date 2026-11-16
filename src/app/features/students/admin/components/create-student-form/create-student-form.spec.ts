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
import { flushStudentsSummary, STUDENTS_URL } from '@features/students/testing/student-test-utils';
import { CreateStudentForm } from './create-student-form';

describe('CreateStudentForm', () => {
  let fixture: ComponentFixture<CreateStudentForm>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;

  const input = (field: string) => element.querySelector<HTMLInputElement>(`#${field}`)!;
  const fill = async (values: Record<string, string>) => {
    Object.entries(values).forEach(([field, value]) => typeInto(input(field), value));
    // The email field is debounced by 100 ms.
    await wait(150);
    await fixture.whenStable();
  };
  const open = async () => {
    store.openCreateModal();
    await fixture.whenStable();
  };
  const confirm = async () => {
    getButton(element, 'Potvrdi')!.click();
    await settle();
  };
  const createRequest = () =>
    http.expectOne((req) => req.url === STUDENTS_URL && req.method === 'POST');

  const validStudent = {
    firstName: 'Jelena',
    lastName: 'Petrović',
    email: 'jelena.petrovic@example.com',
    phoneNumber: '+381641112223',
  };

  beforeEach(async () => {
    toast = createToastServiceMock();

    await TestBed.configureTestingModule({
      imports: [CreateStudentForm],
      providers: [AdminStudentStore, provideHttpTesting({ toastService: toast })],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateStudentForm);
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

  it('renders nothing until the modal is opened', async () => {
    expect(element.querySelector('form')).toBeNull();

    await open();

    expect(element.textContent).toContain('Registracija studenta');
    expect(input('firstName')).not.toBeNull();
  });

  it('registers the student, sends null for an empty university and closes the modal', async () => {
    await open();
    await fill(validStudent);
    await confirm();

    const request = createRequest();
    expect(request.request.body).toEqual({ ...validStudent, university: null });
    request.flush(null);
    await flushStudentsSummary();
    await fixture.whenStable();

    expect(toast.showSuccess).toHaveBeenCalledWith('Student je uspešno registrovan.');
    expect(store.isCreateModalVisible()).toBe(false);
    expect(element.querySelector('form')).toBeNull();
  });

  it('sends the trimmed university when it is filled in', async () => {
    await open();
    await fill({ ...validStudent, university: '  Fakultet organizacionih nauka ' });
    await confirm();

    const request = createRequest();
    expect(request.request.body.university).toBe('Fakultet organizacionih nauka');
    request.flush(null);
    await flushStudentsSummary();
  });

  it('starts empty when the modal is opened again after a registration', async () => {
    await open();
    await fill(validStudent);
    await confirm();
    createRequest().flush(null);
    await flushStudentsSummary();

    await open();

    expect(input('firstName').value).toBe('');
    expect(input('email').value).toBe('');
    expect(element.textContent).not.toContain('Ime je obavezno.');
  });

  it('does not register and shows the validation messages when required fields are empty', async () => {
    await open();
    await fill({ email: 'nije-email' });
    await confirm();
    await fixture.whenStable();

    http.expectNone((req) => req.url === STUDENTS_URL && req.method === 'POST');
    expect(element.textContent).toContain('Ime je obavezno.');
    expect(element.textContent).toContain('Prezime je obavezno.');
    expect(element.textContent).toContain('Email adresa nije validna.');
    expect(element.textContent).toContain('Broj telefona je obavezan.');
    expect(store.isCreateModalVisible()).toBe(true);
  });

  it('shows the taken email error on the email field and stays open', async () => {
    await open();
    await fill(validStudent);
    await confirm();

    createRequest().flush(createProblemDetails('User.EmailAlreadyExists'), {
      status: 409,
      statusText: 'Conflict',
    });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Korisnik sa ovom email adresom već postoji.');
    expect(toast.showError).not.toHaveBeenCalled();
    expect(store.isCreateModalVisible()).toBe(true);
    expect(input('firstName').value).toBe('Jelena');
  });

  it('"Odustani" closes the modal and discards what was typed', async () => {
    await open();
    await fill(validStudent);

    getButton(element, 'Odustani')!.click();
    await fixture.whenStable();
    expect(store.isCreateModalVisible()).toBe(false);

    await open();
    expect(input('firstName').value).toBe('');
    http.expectNone((req) => req.url === STUDENTS_URL && req.method === 'POST');
  });
});
