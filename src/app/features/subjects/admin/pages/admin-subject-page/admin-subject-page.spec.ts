import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSubjectStore } from '@features/subjects/admin/stores/admin-subject-store';
import {
  createSubject,
  createSubjectsSummary,
  flushSummary,
  provideSubjectTesting,
  settle,
} from '@features/subjects/testing/subject-test-utils';
import { AdminSubjectPage } from './admin-subject-page';

describe('AdminSubjectPage', () => {
  let fixture: ComponentFixture<AdminSubjectPage>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminSubjectStore>;

  const statsValues = () =>
    Array.from(element.querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubjectPage],
      providers: [provideSubjectTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubjectPage);
    element = fixture.nativeElement;
    // The page provides its own store instance.
    store = fixture.debugElement.injector.get(AdminSubjectStore);

    await flushSummary(
      createSubjectsSummary({
        totalSubjects: 5,
        untaughtSubjects: 2,
        taughtSubjects: 3,
        mostPopularSubject: createSubject({ subjectName: 'Baze podataka' }),
      }),
    );
    await fixture.whenStable();
  });

  it('renders the list, details, most popular subject and the create form', () => {
    expect(element.querySelector('app-admin-subject-list')).not.toBeNull();
    expect(element.querySelector('app-admin-subject-details')).not.toBeNull();
    expect(element.querySelector('app-edit-subject-form')).toBeNull();
    expect(element.querySelector('app-create-subject-form')).not.toBeNull();
    expect(element.querySelector('app-most-popular-subject')?.textContent).toContain(
      'Baze podataka',
    );
  });

  it('shows total, untaught and taught counts from the summary', () => {
    expect(statsValues()).toEqual(['5', '2', '3']);
  });

  it('swaps the details for the edit form while editing and back when done', async () => {
    store.selectSubject(createSubject());
    store.startEditing();
    await settle();
    await fixture.whenStable();

    expect(element.querySelector('app-edit-subject-form')).not.toBeNull();
    expect(element.querySelector('app-admin-subject-details')).toBeNull();

    store.stopEditing();
    await fixture.whenStable();

    expect(element.querySelector('app-admin-subject-details')).not.toBeNull();
    expect(element.querySelector('app-edit-subject-form')).toBeNull();
  });

  it('gets a fresh store per page instance', () => {
    expect(() => TestBed.inject(AdminSubjectStore)).toThrow();
  });
});
