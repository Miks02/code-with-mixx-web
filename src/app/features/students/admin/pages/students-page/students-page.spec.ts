import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getButton, provideHttpTesting, settle } from '@core/testing/test-utils';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import {
  createPagedStudents,
  createStudent,
  createStudentsSummary,
  expectStudentsRequest,
  flushStudentsSummary,
  STUDENTS_URL,
} from '@features/students/testing/student-test-utils';
import { StudentsPage } from './students-page';

describe('StudentsPage', () => {
  let fixture: ComponentFixture<StudentsPage>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;

  const jelena = createStudent({ id: 'student-2', firstName: 'Jelena', lastName: 'Petrović' });
  const summary = createStudentsSummary({
    activeStudents: 12,
    pendingStudents: 3,
    deactivatedStudents: 2,
    deletedStudents: 1,
    mostActiveStudent: jelena,
    pagedStudents: createPagedStudents([createStudent(), jelena], {
      totalCount: 18,
      totalPages: 2,
      hasNextPage: true,
    }),
  });

  const statsValues = () =>
    Array.from(element.querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );
  const cards = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-student-card button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsPage],
      providers: [provideRouter([]), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsPage);
    element = fixture.nativeElement;
    store = fixture.debugElement.injector.get(AdminStudentStore);
    http = TestBed.inject(HttpTestingController);

    await flushStudentsSummary(summary);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('loads the first page only through the summary request', () => {
    http.expectNone((req) => req.url === STUDENTS_URL);
    expect(cards().length).toBe(2);
  });

  it('shows active, pending, deactivated and deleted counts from the summary', () => {
    expect(statsValues()).toEqual(['12', '3', '2', '1']);
  });

  it('shows the most active student from the summary', () => {
    expect(element.querySelector('app-most-active-student')?.textContent).toContain(
      'Jelena Petrović',
    );
  });

  it('shows the first student right away and then the one clicked in the list', async () => {
    expect(element.querySelector('app-student-details h2')?.textContent).toContain(
      'Marko Jovanović',
    );

    cards()[1].click();
    await fixture.whenStable();

    expect(element.querySelector('app-student-details h2')?.textContent).toContain(
      'Jelena Petrović',
    );
  });

  it('swaps the details for the edit form and back', async () => {
    getButton(element, 'Izmeni')!.click();
    await fixture.whenStable();
    expect(element.querySelector('app-edit-student-form')).not.toBeNull();
    expect(element.querySelector('app-student-details')).toBeNull();

    getButton(element, 'Otkaži')!.click();
    await fixture.whenStable();
    expect(element.querySelector('app-edit-student-form')).toBeNull();
    expect(element.querySelector('app-student-details h2')?.textContent).toContain(
      'Marko Jovanović',
    );
  });

  it('closes the edit form when another student is picked from the list', async () => {
    getButton(element, 'Izmeni')!.click();
    await fixture.whenStable();

    cards()[1].click();
    await fixture.whenStable();

    expect(element.querySelector('app-edit-student-form')).toBeNull();
    expect(element.querySelector('app-student-details h2')?.textContent).toContain(
      'Jelena Petrović',
    );
  });

  it('opens the registration modal from the list', async () => {
    expect(element.querySelector('app-create-student-form form')).toBeNull();

    getButton(element, 'Dodaj')!.click();
    await fixture.whenStable();

    expect(element.querySelector('app-create-student-form form')).not.toBeNull();
  });

  it('sends a single paged request (and no summary) when the page changes', async () => {
    store.nextPage();
    await settle();

    expectStudentsRequest({ pageNumber: '2' }).flush(
      createPagedStudents([createStudent({ id: 'student-3' })], {
        pageNumber: 2,
        hasPreviousPage: true,
      }),
    );
    await settle();

    http.expectNone((req) => req.url.endsWith('/summary'));
  });

  it('gets its own store instance', () => {
    expect(() => TestBed.inject(AdminStudentStore)).toThrow();
  });
});
