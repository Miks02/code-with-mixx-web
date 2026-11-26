import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSubjectStore } from '@features/subjects/admin/stores/admin-subject-store';
import {
  createPagedSubjects,
  createSubject,
  createSubjectsSummary,
  flushSummary,
  getButton,
  provideSubjectTesting,
  settle,
  SUBJECTS_URL,
  typeInto,
} from '@features/subjects/testing/subject-test-utils';
import { AdminSubjectList } from './admin-subject-list';

describe('AdminSubjectList', () => {
  let fixture: ComponentFixture<AdminSubjectList>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminSubjectStore>;
  let http: HttpTestingController;

  const subjects = [
    createSubject({ id: 1, subjectName: 'Osnove programiranja' }),
    createSubject({ id: 2, subjectName: 'Baze podataka' }),
  ];
  const firstPage = createPagedSubjects(subjects, {
    totalCount: 3,
    totalPages: 2,
    hasNextPage: true,
  });

  const cards = () => Array.from(element.querySelectorAll('app-subject-card'));
  const pagination = () => element.querySelector('.mt-auto')!;
  const paginationButtons = () =>
    Array.from(pagination().querySelectorAll<HTMLButtonElement>('button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubjectList],
      providers: [AdminSubjectStore, provideSubjectTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubjectList);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminSubjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  it('shows skeletons while the subjects are loading', async () => {
    await settle();

    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(cards().length).toBe(0);

    await flushSummary();
  });

  describe('with loaded subjects', () => {
    beforeEach(async () => {
      await flushSummary(createSubjectsSummary({ pagedSubjects: firstPage }));
      await fixture.whenStable();
    });

    it('renders a card for every subject on the page', () => {
      expect(cards().length).toBe(2);
      expect(element.textContent).toContain('Osnove programiranja');
      expect(element.textContent).toContain('Baze podataka');
    });

    it('shows the shown/total count and the current page', () => {
      expect(pagination().textContent).toContain('Prikazano 2 od 3');
      expect(pagination().textContent).toMatch(/1\s*\/\s*2/);
    });

    it('selects a subject in the store when its card is clicked and highlights it', async () => {
      cards()[1].querySelector('button')!.click();
      await fixture.whenStable();

      expect(store.selectedSubject()?.id).toBe(2);
      expect(cards()[1].querySelector('button')!.classList).toContain('bg-emerald-600');
      expect(cards()[0].querySelector('button')!.classList).not.toContain('bg-emerald-600');
    });

    it('passes the counts to the cards', () => {
      const counts = Array.from(cards()[0].querySelectorAll('span')).map(
        (span) => span.textContent,
      );
      expect(counts).toContain('4');
      expect(counts).toContain('7');
    });

    it('clears the selection when the selected card is clicked again', async () => {
      cards()[1].querySelector('button')!.click();
      await fixture.whenStable();
      cards()[1].querySelector('button')!.click();
      await fixture.whenStable();

      expect(store.selectedSubject()).toBeUndefined();
      expect(cards()[1].querySelector('button')!.classList).not.toContain('bg-emerald-600');
    });

    it('disables the previous button on the first page and loads the next page', async () => {
      const [previous, next] = paginationButtons();
      expect(previous.disabled).toBe(true);
      expect(next.disabled).toBe(false);

      next.click();
      await settle();

      http
        .expectOne((req) => req.url === SUBJECTS_URL && req.params.get('pageNumber') === '2')
        .flush(
          createPagedSubjects([createSubject({ id: 3, subjectName: 'Web programiranje' })], {
            totalCount: 3,
            pageNumber: 2,
            totalPages: 2,
            hasPreviousPage: true,
          }),
        );
      await settle();
      await fixture.whenStable();

      expect(store.params.pageNumber()).toBe(2);
      expect(element.textContent).toContain('Web programiranje');
      expect(pagination().textContent).toMatch(/2\s*\/\s*2/);
      expect(paginationButtons()[1].disabled).toBe(true);
    });

    it('toggles the archived filter from the "Arhivirani" button', async () => {
      getButton(element, 'Arhivirani')!.click();
      await settle();

      expect(store.params.onlyArchived()).toBe(true);
      http
        .expectOne((req) => req.url === SUBJECTS_URL && req.params.get('onlyArchived') === 'true')
        .flush(createPagedSubjects([]));
      await settle();
    });

    it('passes the typed search term to the store (debounced)', async () => {
      typeInto(element.querySelector<HTMLInputElement>('app-search-bar input')!, 'baz');
      await new Promise((resolve) => setTimeout(resolve, 350));
      await settle();

      expect(store.params.searchTerm()).toBe('baz');
      http
        .expectOne((req) => req.url === SUBJECTS_URL && req.params.get('searchTerm') === 'baz')
        .flush(createPagedSubjects([subjects[1]]));
      await settle();
    });
  });

  it('shows the empty state when there are no subjects', async () => {
    await flushSummary(createSubjectsSummary({ pagedSubjects: createPagedSubjects([]) }));
    await fixture.whenStable();

    expect(cards().length).toBe(0);
    expect(element.textContent).toContain('Nije pronadjen nijedan predmet');
  });
});
