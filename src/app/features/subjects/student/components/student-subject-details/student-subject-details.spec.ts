import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';
import {
  createPagedStudentSubjects,
  createStudentSubject,
  createStudentSubjectsSummary,
  flushStudentSummary,
  provideSubjectTesting,
} from '@features/subjects/testing/subject-test-utils';
import { StudentSubjectDetails } from './student-subject-details';

describe('StudentSubjectDetails', () => {
  let fixture: ComponentFixture<StudentSubjectDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof StudentSubjectStore>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSubjectDetails],
      providers: [StudentSubjectStore, provideSubjectTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentSubjectDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(StudentSubjectStore);
    http = TestBed.inject(HttpTestingController);

    await flushStudentSummary(
      createStudentSubjectsSummary({
        pagedSubjects: createPagedStudentSubjects([
          createStudentSubject({ id: 1 }),
          createStudentSubject({
            id: 2,
            subjectName: 'Baze podataka',
            subjectDescription: 'Relacioni model i SQL upiti',
            classesCount: 0,
          }),
        ]),
      }),
    );
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('shows the subject selected in the store', async () => {
    store.selectSubject(store.pagedSubjectsItems()![1]);
    await fixture.whenStable();

    expect(element.textContent).toContain('Baze podataka');
    expect(element.textContent).toContain('Relacioni model i SQL upiti');
    const values = Array.from(element.querySelectorAll('span.font-semibold')).map(
      (span) => span.textContent,
    );
    expect(values).toEqual(['0']);
  });

  it('shows the empty state when nothing is selected', async () => {
    store.selectSubject(undefined);
    await fixture.whenStable();

    expect(element.textContent).toContain('Izaberi predmet iz liste da vidiš detalje');
    expect(element.textContent).toContain('Detalji predmeta');
  });
});
