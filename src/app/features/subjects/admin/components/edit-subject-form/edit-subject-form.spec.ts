import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSubjectStore } from '@features/subjects/admin/stores/admin-subject-store';
import {
  createProblemDetails,
  createSubject,
  createToastServiceMock,
  flushSummary,
  getButton,
  provideSubjectTesting,
  settle,
  SUBJECTS_URL,
  typeInto,
} from '@features/subjects/testing/subject-test-utils';
import { EditSubjectForm } from './edit-subject-form';

describe('EditSubjectForm', () => {
  let fixture: ComponentFixture<EditSubjectForm>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminSubjectStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;

  const nameInput = () => element.querySelector<HTMLInputElement>('#subjectName')!;
  const descriptionInput = () => element.querySelector<HTMLTextAreaElement>('#subjectDescription')!;
  const save = async () => {
    getButton(element, 'Sačuvaj izmene')!.click();
    await settle();
  };

  beforeEach(async () => {
    toast = createToastServiceMock();

    await TestBed.configureTestingModule({
      imports: [EditSubjectForm],
      providers: [AdminSubjectStore, provideSubjectTesting(toast)],
    }).compileComponents();

    store = TestBed.inject(AdminSubjectStore);
    http = TestBed.inject(HttpTestingController);
    await flushSummary();

    store.selectSubject(createSubject());
    store.startEditing();

    fixture = TestBed.createComponent(EditSubjectForm);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(async () => {
    await flushSummary();
    http.verify();
  });

  it('is prefilled with the selected subject', () => {
    expect(nameInput().value).toBe('Osnove programiranja');
    expect(descriptionInput().value).toBe('Promenljive, petlje i funkcije u JavaScript-u');
  });

  it('closes the form on "Otkaži" without saving', async () => {
    getButton(element, 'Otkaži')!.click();
    await settle();

    expect(store.isEditing()).toBe(false);
    expect(store.selectedSubject()?.subjectName).toBe('Osnove programiranja');
  });

  it('saves the changes, updates the selected subject and closes the form', async () => {
    typeInto(nameInput(), 'Osnove programiranja 2');
    await fixture.whenStable();
    await save();

    const request = http.expectOne(`${SUBJECTS_URL}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      subjectName: 'Osnove programiranja 2',
      subjectDescription: 'Promenljive, petlje i funkcije u JavaScript-u',
    });
    request.flush(createSubject({ subjectName: 'Osnove programiranja 2' }));
    await flushSummary();

    expect(store.selectedSubject()?.subjectName).toBe('Osnove programiranja 2');
    expect(store.isEditing()).toBe(false);
  });

  it('does not save and shows the validation message when the name is too short', async () => {
    typeInto(nameInput(), 'JS');
    await fixture.whenStable();
    await save();
    await fixture.whenStable();

    http.expectNone(`${SUBJECTS_URL}/1`);
    expect(element.textContent).toContain('Naziv predmeta mora imati najmanje 3 karaktera');
    expect(store.isEditing()).toBe(true);
  });

  it('shows the duplicate name error on the name field and stays open', async () => {
    typeInto(nameInput(), 'Baze podataka');
    await fixture.whenStable();
    await save();

    http.expectOne(`${SUBJECTS_URL}/1`).flush(createProblemDetails('Subject.AlreadyExists'), {
      status: 409,
      statusText: 'Conflict',
    });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Predmet sa ovim nazivom već postoji.');
    expect(toast.showError).not.toHaveBeenCalled();
    expect(store.isEditing()).toBe(true);
    expect(store.selectedSubject()?.subjectName).toBe('Osnove programiranja');
  });
});
