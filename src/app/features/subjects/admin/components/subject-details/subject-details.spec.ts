import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogResult } from '@core/components/dialog/dialog';
import { DialogService } from '@core/services/dialog-service';
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
} from '@features/subjects/testing/subject-test-utils';
import { SubjectDetails } from './subject-details';

describe('SubjectDetails', () => {
  let fixture: ComponentFixture<SubjectDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminSubjectStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: { showDialog: ReturnType<typeof vi.fn> };

  const select = async (overrides = {}) => {
    store.selectSubject(createSubject(overrides));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    toast = createToastServiceMock();
    dialog = { showDialog: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SubjectDetails],
      providers: [
        AdminSubjectStore,
        provideSubjectTesting(toast),
        { provide: DialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminSubjectStore);
    http = TestBed.inject(HttpTestingController);
    await flushSummary();
  });

  afterEach(async () => {
    await flushSummary();
    http.verify();
  });

  it('asks to pick a subject when nothing is selected', async () => {
    await fixture.whenStable();
    expect(element.textContent).toContain('Izaberi predmet iz liste da vidiš detalje');
  });

  it('shows the selected subject with its stats', async () => {
    await select();

    expect(element.querySelector('h2')?.textContent).toContain('Osnove programiranja');
    expect(element.textContent).toContain('Promenljive, petlje i funkcije u JavaScript-u');
    expect(element.textContent).toMatch(/4\s*Časovi/);
    expect(element.textContent).toMatch(/7\s*Studenti/);
    expect(element.textContent).not.toContain('Izmenjeno');
    expect(element.textContent).not.toContain('Arhivirano');
  });

  it('shows the "Izmenjeno" and "Arhivirano" stats when the subject has those dates', async () => {
    await select({
      updatedAt: '2026-03-01T00:00:00.000Z',
      deletedAt: '2026-04-01T00:00:00.000Z',
    });

    expect(element.textContent).toContain('Izmenjeno');
    expect(element.textContent).toContain('Arhivirano');
  });

  it('opens the edit form through the store', async () => {
    await select();

    getButton(element, 'Izmeni')!.click();

    expect(store.isEditing()).toBe(true);
  });

  it('archives the subject and marks it as archived', async () => {
    await select();

    getButton(element, 'Arhiviraj')!.click();
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/1/archive`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
    await flushSummary();
    await fixture.whenStable();

    expect(store.selectedSubject()?.deletedAt).toBeTruthy();
    expect(getButton(element, 'Vrati iz arhive')).toBeDefined();
    expect(getButton(element, 'Arhiviraj')).toBeUndefined();
  });

  it('restores an archived subject and clears its archive date', async () => {
    await select({ deletedAt: '2026-04-01T00:00:00.000Z' });

    getButton(element, 'Vrati iz arhive')!.click();
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/1/restore`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
    await flushSummary();
    await fixture.whenStable();

    expect(store.selectedSubject()?.deletedAt).toBeNull();
    expect(getButton(element, 'Arhiviraj')).toBeDefined();
  });

  it('shows the domain error message when archiving fails', async () => {
    await select();

    getButton(element, 'Arhiviraj')!.click();
    await settle();

    http
      .expectOne(`${SUBJECTS_URL}/1/archive`)
      .flush(createProblemDetails('Subject.AlreadyArchived'), {
        status: 409,
        statusText: 'Conflict',
      });
    await settle();

    expect(toast.showError).toHaveBeenCalledWith('Predmet je već arhiviran.');
    expect(store.selectedSubject()?.deletedAt).toBeNull();
  });

  it('hides "Obriši" for a subject that has classes', async () => {
    await select({ classesCount: 3 });
    expect(getButton(element, 'Obriši')).toBeUndefined();
  });

  it('deletes the subject after confirmation and clears the selection', async () => {
    dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
    await select({ classesCount: 0 });

    getButton(element, 'Obriši')!.click();
    await settle();

    expect(dialog.showDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Brisanje predmeta' }),
    );
    const request = http.expectOne(`${SUBJECTS_URL}/1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    await flushSummary();

    expect(toast.showSuccess).toHaveBeenCalledWith('Predmet je uspešno obrisan.');
    expect(store.selectedSubject()).toBeUndefined();
  });

  it('does not delete when the dialog is cancelled', async () => {
    dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
    await select({ classesCount: 0 });

    getButton(element, 'Obriši')!.click();
    await settle();

    http.expectNone(`${SUBJECTS_URL}/1`);
    expect(store.selectedSubject()?.id).toBe(1);
  });
});
