import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';
import {
  createPagedStudentSubjects,
  createStudentSubject,
  createStudentSubjectsSummary,
  flushStudentSummary,
  provideSubjectTesting,
  settle,
} from '@features/subjects/testing/subject-test-utils';
import { StudentSubjectList } from './student-subject-list';

describe('StudentSubjectList', () => {
  let fixture: ComponentFixture<StudentSubjectList>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const cards = () => Array.from(element.querySelectorAll('app-subject-card'));

  const flushPage = async (page = createPagedStudentSubjects()) => {
    await flushStudentSummary(createStudentSubjectsSummary({ pagedSubjects: page }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSubjectList],
      providers: [StudentSubjectStore, provideSubjectTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentSubjectList);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows skeletons while the subjects are loading', async () => {
    await settle();

    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(cards().length).toBe(0);

    await flushPage();
  });

  it('renders a card with the counts for every subject on the page', async () => {
    await flushPage(
      createPagedStudentSubjects([
        createStudentSubject({ id: 1, subjectName: 'Osnove programiranja', classesCount: 0 }),
        createStudentSubject({ id: 2, subjectName: 'Baze podataka', classesCount: 12 }),
      ]),
    );

    expect(cards().length).toBe(2);
    expect(element.textContent).toContain('Osnove programiranja');
    expect(element.textContent).toContain('Baze podataka');
    const counts = Array.from(element.querySelectorAll('app-subject-card span')).map(
      (span) => span.textContent,
    );
    expect(counts).toContain('0');
    expect(counts).toContain('12');
  });

  it('shows the empty state when there are no subjects', async () => {
    await flushPage(createPagedStudentSubjects([]));

    expect(cards().length).toBe(0);
    expect(element.textContent).toContain('Nije pronađen nijedan predmet');
  });

  it('selects a subject when its card is clicked and clears it on a second click', async () => {
    await flushPage(
      createPagedStudentSubjects([
        createStudentSubject({ id: 1 }),
        createStudentSubject({ id: 2 }),
      ]),
    );
    const store = TestBed.inject(StudentSubjectStore);
    const button = (index: number) => cards()[index].querySelector('button')!;

    button(1).click();
    await fixture.whenStable();

    expect(store.selectedSubjectId()).toBe(2);
    expect(button(1).classList).toContain('bg-emerald-600');
    expect(button(0).classList).not.toContain('bg-emerald-600');

    button(1).click();
    await fixture.whenStable();

    expect(store.selectedSubject()).toBeUndefined();
    expect(button(1).classList).not.toContain('bg-emerald-600');
  });
});
