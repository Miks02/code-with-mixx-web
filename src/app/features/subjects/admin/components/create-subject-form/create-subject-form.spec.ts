import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createProblemDetails,
  createSubject,
  createToastServiceMock,
  getButton,
  provideSubjectTesting,
  settle,
  SUBJECTS_URL,
  typeInto,
} from '@features/subjects/testing/subject-test-utils';
import { CreateSubjectForm } from './create-subject-form';

describe('CreateSubjectForm', () => {
  let fixture: ComponentFixture<CreateSubjectForm>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;

  const nameInput = () => element.querySelector<HTMLInputElement>('#subjectName')!;
  const descriptionInput = () => element.querySelector<HTMLTextAreaElement>('#subjectDescription')!;
  const fill = async (name: string, description: string) => {
    typeInto(nameInput(), name);
    typeInto(descriptionInput(), description);
    await fixture.whenStable();
  };
  // No fixture.whenStable() here: it waits for the pending mutation, which waits for the response.
  const submit = async () => {
    getButton(element, 'Dodaj predmet')!.click();
    await settle();
  };

  beforeEach(async () => {
    toast = createToastServiceMock();

    await TestBed.configureTestingModule({
      imports: [CreateSubjectForm],
      providers: [provideSubjectTesting(toast)],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSubjectForm);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('does not submit an empty form and shows the required messages', async () => {
    await submit();

    http.expectNone(SUBJECTS_URL);
    expect(element.textContent).toContain('Naziv predmeta je obavezan');
    expect(element.textContent).toContain('Opis predmeta je obavezan');
  });

  it('does not submit a too short description', async () => {
    await fill('Baze podataka', 'Kratko');
    await submit();

    http.expectNone(SUBJECTS_URL);
    expect(element.textContent).toContain('Opis predmeta mora imati najmanje 10 karaktera');
  });

  it('creates the subject, shows a success toast and clears the form', async () => {
    await fill('Baze podataka', 'Relacioni model, SQL upiti i normalizacija');
    await submit();

    const request = http.expectOne(SUBJECTS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      subjectName: 'Baze podataka',
      subjectDescription: 'Relacioni model, SQL upiti i normalizacija',
    });
    request.flush(createSubject({ id: 2, subjectName: 'Baze podataka' }));
    await settle();
    await fixture.whenStable();

    expect(toast.showSuccess).toHaveBeenCalledWith('Predmet je uspešno dodat');
    expect(nameInput().value).toBe('');
    expect(descriptionInput().value).toBe('');
  });

  it('shows the duplicate name error on the name field', async () => {
    await fill('Osnove programiranja', 'Promenljive, petlje i funkcije u JavaScript-u');
    await submit();

    http.expectOne(SUBJECTS_URL).flush(createProblemDetails('Subject.AlreadyExists'), {
      status: 409,
      statusText: 'Conflict',
    });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Predmet sa ovim nazivom već postoji.');
    expect(toast.showError).not.toHaveBeenCalled();
    expect(nameInput().value).toBe('Osnove programiranja');
  });
});
