import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PagedResult } from '@core/models/paged-result';
import { PaymentStatus, ReservationStatus, ReservationType } from '@features/reservations';
import { StudentReservation } from '@features/students/models/student-details';
import { StudentReservationsList } from './student-reservations-list';

function reservation(id: number): StudentReservation {
  return {
    id,
    reservationType: ReservationType.Class,
    reservationStatus: ReservationStatus.Confirmed,
    paymentStatus: PaymentStatus.Paid,
    totalPrice: 1300,
    paidAmount: 1300,
    discountRate: 0,
    bonus: 0,
    description: null,
    reservedAt: '2026-10-18',
    createdAt: '2026-10-18T09:00:00Z',
    classes: [
      {
        id,
        subjectId: 1,
        subjectName: 'Baze podataka',
        price: 1300,
        startsAt: '2026-11-03T10:00:00',
        endsAt: '2026-11-03T10:45:00',
        reservedAt: '2026-10-18',
      },
    ],
    projects: [],
  };
}

function paged(
  items: StudentReservation[],
  overrides: Partial<PagedResult<StudentReservation>> = {},
): PagedResult<StudentReservation> {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    paginatedCount: items.length,
    ...overrides,
  };
}

describe('StudentReservationsList', () => {
  let fixture: ComponentFixture<StudentReservationsList>;
  let component: StudentReservationsList;

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function pageButtons(): HTMLButtonElement[] {
    return Array.from(element().querySelectorAll<HTMLButtonElement>('app-button button'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReservationsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentReservationsList);
    component = fixture.componentInstance;
  });

  it('should render skeletons while pending', async () => {
    fixture.componentRef.setInput('isPending', true);
    await fixture.whenStable();

    expect(element().querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(element().querySelector('app-student-reservation-card')).toBeNull();
  });

  it('should render a card per reservation and the count', async () => {
    fixture.componentRef.setInput(
      'pagedReservations',
      paged([reservation(1), reservation(2)], { totalCount: 14 }),
    );
    await fixture.whenStable();

    expect(element().querySelectorAll('app-student-reservation-card').length).toBe(2);
    expect(element().textContent).toContain('Prikazano 2 od 14');
  });

  it('should stretch the last card over the whole row when the count is odd', async () => {
    fixture.componentRef.setInput(
      'pagedReservations',
      paged([reservation(1), reservation(2), reservation(3)]),
    );
    await fixture.whenStable();

    const cards = Array.from(element().querySelectorAll('app-student-reservation-card'));
    expect(cards.map((card) => card.classList.contains('sm:col-span-2'))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('should keep cards in pairs when the count is even', async () => {
    fixture.componentRef.setInput('pagedReservations', paged([reservation(1), reservation(2)]));
    await fixture.whenStable();

    const cards = Array.from(element().querySelectorAll('app-student-reservation-card'));
    expect(cards.some((card) => card.classList.contains('sm:col-span-2'))).toBe(false);
  });

  it('should show the general empty state when there are no reservations', async () => {
    fixture.componentRef.setInput('pagedReservations', paged([]));
    await fixture.whenStable();

    expect(element().textContent).toContain('Student još nema nijednu rezervaciju.');
  });

  it('should show the filtered empty state when a type is selected', async () => {
    fixture.componentRef.setInput('pagedReservations', paged([]));
    fixture.componentRef.setInput('selectedType', ReservationType.Project);
    await fixture.whenStable();

    expect(element().textContent).toContain('Student nema rezervacije ovog tipa.');
  });

  it('should show at least one total page when the result is empty', async () => {
    fixture.componentRef.setInput('pagedReservations', paged([], { totalPages: 0 }));
    await fixture.whenStable();

    expect(element().textContent).toContain('1 / 1');
  });

  it('should emit the next and previous page', async () => {
    const pages: number[] = [];
    component.pageChanged.subscribe((page) => pages.push(page));
    fixture.componentRef.setInput(
      'pagedReservations',
      paged([reservation(1)], {
        pageNumber: 2,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      }),
    );
    await fixture.whenStable();

    const [previous, next] = pageButtons();
    previous.click();
    next.click();

    expect(pages).toEqual([1, 3]);
  });

  it('should not emit a page change past the first or last page', async () => {
    const pages: number[] = [];
    component.pageChanged.subscribe((page) => pages.push(page));
    fixture.componentRef.setInput('pagedReservations', paged([reservation(1)]));
    await fixture.whenStable();

    component.onPreviousPage();
    component.onNextPage();

    expect(pages).toEqual([]);
  });

  it('should emit the selected type from the menu', () => {
    const types: string[] = [];
    component.typeChanged.subscribe((type) => types.push(type));

    fixture.debugElement
      .query((de) => de.name === 'app-sort-menu')
      .triggerEventHandler('sortChanged', ReservationType.Class);

    expect(types).toEqual([ReservationType.Class]);
  });
});
