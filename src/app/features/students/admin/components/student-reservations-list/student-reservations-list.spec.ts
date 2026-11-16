import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { ReservationType } from '@features/reservations';
import { AdminStudentDetailsStore } from '@features/students/admin/stores/admin-student-details-store';
import {
  createPagedReservations,
  createStudentDetails,
  createStudentReservation,
  expectStudentDetailsRequest,
  flushStudentDetails,
  provideStudentRoute,
} from '@features/students/testing/student-test-utils';
import { StudentReservationsList } from './student-reservations-list';

describe('StudentReservationsList', () => {
  let fixture: ComponentFixture<StudentReservationsList>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminStudentDetailsStore>;
  let http: HttpTestingController;

  const cards = () =>
    Array.from(element.querySelectorAll<HTMLElement>('app-student-reservation-card'));
  const pageButton = (label: string) =>
    element.querySelector<HTMLButtonElement>(`app-button[aria-label="${label}"] button`)!;
  const typeOption = (label: string) =>
    Array.from(
      element.querySelectorAll('app-sort-menu ul')[0].querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.includes(label))!;

  const withReservations = (count: number, overrides = {}) =>
    createStudentDetails({
      reservations: createPagedReservations(
        Array.from({ length: count }, (_, index) => createStudentReservation({ id: index + 1 })),
        overrides,
      ),
    });

  const load = async (details = withReservations(2)) => {
    await flushStudentDetails(details);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReservationsList],
      providers: [
        AdminStudentDetailsStore,
        provideRouter([]),
        provideStudentRoute(),
        provideHttpTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentReservationsList);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminStudentDetailsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders a card per reservation and the count', async () => {
    await load(withReservations(2, { totalCount: 14, totalPages: 2, hasNextPage: true }));

    expect(cards().length).toBe(2);
    expect(element.textContent).toContain('Prikazano 2 od 14');
    expect(element.textContent).toMatch(/1\s*\/\s*2/);
  });

  it('stretches only the last card when the count is odd', async () => {
    await load(withReservations(3));

    expect(cards().map((card) => card.classList.contains('sm:col-span-2'))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('says the student has no reservations at all when no type is selected', async () => {
    await load(withReservations(0, { totalPages: 0 }));

    expect(element.textContent).toContain('Student još nema nijednu rezervaciju.');
    expect(element.textContent).toMatch(/1\s*\/\s*1/);
  });

  it('says there are none of this type when a type is selected', async () => {
    await load();
    element.querySelector<HTMLButtonElement>('app-sort-menu button')!.click();
    await fixture.whenStable();

    typeOption('Projekti').click();
    await settle();
    expectStudentDetailsRequest({ reservationType: ReservationType.Project }).flush(
      withReservations(0),
    );
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Student nema rezervacije ovog tipa.');
  });

  it('loads the next page and disables the buttons at the edges', async () => {
    await load(withReservations(2, { totalCount: 3, totalPages: 2, hasNextPage: true }));
    expect(pageButton('Prethodna strana').disabled).toBe(true);

    pageButton('Sledeća strana').click();
    await settle();
    expectStudentDetailsRequest({ pageNumber: '2' }).flush(
      withReservations(1, { pageNumber: 2, totalCount: 3, totalPages: 2, hasPreviousPage: true }),
    );
    await settle();
    await fixture.whenStable();

    expect(store.currentPage()).toBe(2);
    expect(element.textContent).toMatch(/2\s*\/\s*2/);
    expect(pageButton('Sledeća strana').disabled).toBe(true);
    expect(pageButton('Prethodna strana').disabled).toBe(false);
  });

  it('dims the cards while another page is loading', async () => {
    await load(withReservations(2, { totalPages: 2, hasNextPage: true }));

    pageButton('Sledeća strana').click();
    // Not whenStable: it would wait for the pending request.
    await settle();
    fixture.detectChanges();
    expect(cards()[0].querySelector('a')!.style.opacity).toBe('0.5');

    expectStudentDetailsRequest({ pageNumber: '2' }).flush(withReservations(1, { pageNumber: 2 }));
    await settle();
  });
});
