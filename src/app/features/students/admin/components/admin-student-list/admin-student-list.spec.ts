import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '@core/models/account-status';
import { provideHttpTesting, settle, typeInto, wait } from '@core/testing/test-utils';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { StudentFilter } from '@features/students/models/student-filter';
import {
  createPagedStudents,
  createStudent,
  createStudentsSummary,
  expectStudentsRequest,
  flushStudentsSummary,
} from '@features/students/testing/student-test-utils';
import { AdminStudentList } from './admin-student-list';

describe('AdminStudentList', () => {
  let fixture: ComponentFixture<AdminStudentList>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentStore>;
  let http: HttpTestingController;

  const firstPage = createPagedStudents(
    [
      createStudent(),
      createStudent({
        id: 'student-2',
        firstName: 'Jelena',
        lastName: 'Petrović',
        accountStatus: AccountStatus.Pending,
      }),
    ],
    { totalCount: 3, totalPages: 2, hasNextPage: true },
  );

  const cards = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-student-card button'));
  const pageButtons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-button[variant="ghost"] button'));
  const filterOptions = () =>
    Array.from(
      element
        .querySelectorAll('app-filter-menu ul')[0]
        .querySelectorAll<HTMLButtonElement>('button'),
    );
  const filterOption = (label: string) =>
    filterOptions().find((option) => option.textContent?.includes(label))!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStudentList],
      providers: [AdminStudentStore, provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStudentList);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminStudentStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushStudentsSummary();
    http.verify();
  });

  it('shows skeletons while the students are loading', async () => {
    await settle();
    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(cards().length).toBe(0);
  });

  it('shows the empty state when there are no students', async () => {
    await flushStudentsSummary(createStudentsSummary({ pagedStudents: createPagedStudents([]) }));
    await fixture.whenStable();

    expect(cards().length).toBe(0);
    expect(element.querySelectorAll('app-skeleton').length).toBe(0);
    expect(element.textContent).toContain('Nije pronadjen nijedan student');
  });

  describe('with loaded students', () => {
    beforeEach(async () => {
      await flushStudentsSummary(createStudentsSummary({ pagedStudents: firstPage }));
      await fixture.whenStable();
    });

    it('renders a card per student and the pagination summary', () => {
      expect(cards().length).toBe(2);
      expect(cards()[0].textContent).toContain('Marko Jovanović');
      expect(cards()[1].textContent).toContain('Jelena Petrović');
      expect(element.textContent).toContain('Prikazano 2 od 3');
      expect(element.textContent).toMatch(/1\s*\/\s*2/);
    });

    it('selects a student on click and deselects on a second click', async () => {
      cards()[1].click();
      await fixture.whenStable();
      expect(store.selectedStudentId()).toBe('student-2');

      cards()[1].click();
      await fixture.whenStable();
      expect(store.selectedStudent()).toBeUndefined();
    });

    it('highlights only the selected card', async () => {
      const before = cards().map((card) => card.className);

      cards()[0].click();
      await fixture.whenStable();

      expect(cards()[0].className).not.toBe(before[0]);
      expect(cards()[1].className).toBe(before[1]);
    });

    it('opens the create modal from the "Dodaj" button', async () => {
      element.querySelector<HTMLButtonElement>('button[aria-label="Dodaj studenta"]')!.click();
      await fixture.whenStable();

      expect(store.isCreateModalVisible()).toBe(true);
    });

    it('disables the previous page button and loads the next page', async () => {
      const [previous, next] = pageButtons();
      expect(previous.disabled).toBe(true);

      next.click();
      await settle();

      expectStudentsRequest({ pageNumber: '2' }).flush(
        createPagedStudents([createStudent({ id: 'student-3', firstName: 'Nikola' })], {
          totalCount: 3,
          pageNumber: 2,
          totalPages: 2,
          hasPreviousPage: true,
        }),
      );
      await settle();
      await fixture.whenStable();

      expect(cards().length).toBe(1);
      expect(cards()[0].textContent).toContain('Nikola');
      expect(element.textContent).toMatch(/2\s*\/\s*2/);
      expect(pageButtons()[1].disabled).toBe(true);
    });

    it('dims the cards while another page is loading', async () => {
      pageButtons()[1].click();
      // Not whenStable: it would wait for the pending request.
      await settle();
      fixture.detectChanges();

      expect(cards()[0].style.opacity).toBe('0.5');

      expectStudentsRequest({ pageNumber: '2' }).flush(
        createPagedStudents([createStudent({ id: 'student-3' })], { pageNumber: 2 }),
      );
      await settle();
      await fixture.whenStable();

      expect(cards()[0].style.opacity).toBe('');
    });

    it('requests the students matching the typed search term (debounced)', async () => {
      typeInto(element.querySelector<HTMLInputElement>('app-search-bar input')!, 'jelena');
      await wait(350);
      await settle();

      expectStudentsRequest({ searchTerm: 'jelena', pageNumber: '1' }).flush(
        createPagedStudents([firstPage.items[1]]),
      );
      await settle();
      await fixture.whenStable();

      expect(cards().length).toBe(1);
    });

    it('requests the students for the filters picked in the filter menu', async () => {
      element.querySelector<HTMLButtonElement>('app-filter-menu button')!.click();
      await fixture.whenStable();

      filterOption('Aktivni').click();
      await settle();
      expectStudentsRequest({ filters: [StudentFilter.Active] }).flush(firstPage);
      await settle();
      await fixture.whenStable();

      filterOption('Sa časovima').click();
      await settle();
      expectStudentsRequest({
        filters: [StudentFilter.Active, StudentFilter.WithClasses],
      }).flush(firstPage);
      await settle();
    });

    it('blocks filters that contradict the selected one', async () => {
      element.querySelector<HTMLButtonElement>('app-filter-menu button')!.click();
      await fixture.whenStable();

      filterOption('Obrisani').click();
      await settle();
      expectStudentsRequest({ filters: [StudentFilter.Deleted] }).flush(firstPage);
      await settle();
      await fixture.whenStable();

      expect(filterOption('Aktivni').disabled).toBe(true);
      expect(filterOption('Deaktivirani').disabled).toBe(true);
      expect(filterOption('Na čekanju').disabled).toBe(true);
      expect(filterOption('Sa projektima').disabled).toBe(false);
    });
  });
});
