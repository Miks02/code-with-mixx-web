import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { AdminClassStore } from '@features/classes/admin/stores/admin-class-store';
import {
  createClassesSummary,
  createClassReservation,
  createPagedClassReservations,
  expectClassReservationsRequest,
  flushClassesSummary,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationsList } from './class-reservations-list';

describe('ClassReservationsList', () => {
  let fixture: ComponentFixture<ClassReservationsList>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminClassStore>;
  let http: HttpTestingController;

  const firstPage = createPagedClassReservations(
    [
      createClassReservation({ id: 1 }),
      createClassReservation({ id: 2, studentFullName: 'Jelena Petrović' }),
    ],
    { totalCount: 3, totalPages: 2, hasNextPage: true },
  );

  const cards = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-class-reservation-card button'));
  const filterMenu = (placeholder: string) =>
    Array.from(element.querySelectorAll('app-filter-menu')).find(
      (menu) => menu.getAttribute('placeholder') === placeholder,
    )!;
  const pickFilter = async (placeholder: string, label: string) => {
    filterMenu(placeholder).querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    Array.from(filterMenu(placeholder).querySelectorAll('ul')[0].querySelectorAll('button'))
      .find((option) => option.textContent?.includes(label))!
      .click();
    await settle();
  };
  const pageButtons = () =>
    Array.from(
      element.querySelectorAll<HTMLButtonElement>('app-button[icon^="faSolidChevron"] button'),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationsList],
      providers: [
        AdminClassStore,
        provideRouter([{ path: 'admin/classes/create', children: [] }]),
        provideHttpTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationsList);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminClassStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushClassesSummary();
    http.verify();
  });

  it('shows skeletons while loading and the empty state when nothing matches', async () => {
    await settle();
    fixture.detectChanges();
    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);

    await flushClassesSummary(
      createClassesSummary({ reservations: createPagedClassReservations([]) }),
    );
    await fixture.whenStable();
    expect(element.querySelector('app-skeleton')).toBeNull();
    expect(element.textContent).toContain('Nije pronađena nijedna rezervacija časova');
    expect(element.textContent).toContain('Prikazano 0 od 0');
  });

  describe('with loaded reservations', () => {
    beforeEach(async () => {
      await flushClassesSummary(createClassesSummary({ reservations: firstPage }));
      await fixture.whenStable();
    });

    it('renders a card per reservation and the pagination summary', () => {
      expect(cards().length).toBe(2);
      expect(element.textContent).toContain('Prikazano 2 od 3');
      expect(element.textContent).toMatch(/1\s*\/\s*2/);
    });

    it('selects a card on click and clears the selection on a second click', async () => {
      cards()[1].click();
      await fixture.whenStable();
      expect(store.selectedReservationId()).toBe(2);

      cards()[1].click();
      await fixture.whenStable();
      expect(store.selectedReservation()).toBeUndefined();
    });

    it('offers the subjects from the lookup and sends the picked ones as numbers', async () => {
      await pickFilter('Predmet', 'Web programiranje');

      expect(store.params.subjectIds()).toEqual([2]);
      expectClassReservationsRequest({ subjectIds: ['2'], pageNumber: '1' }).flush(firstPage);
      await settle();
    });

    it.each([
      ['Status plaćanja', 'Kasni uplata', { paymentStatuses: [PaymentStatus.Overdue] }],
      ['Status rezervacije', 'Završen', { reservationStatuses: [ReservationStatus.Completed] }],
    ])('filters by %s', async (placeholder, label, params) => {
      await pickFilter(placeholder, label);

      expectClassReservationsRequest(params).flush(firstPage);
      await settle();
    });

    it('has no project type filter', () => {
      expect(filterMenu('Tip projekta')).toBeUndefined();
    });

    it('both the desktop and the mobile archive button show archived reservations', async () => {
      const desktop = element.querySelector<HTMLButtonElement>(
        'app-button[icon="faSolidBoxArchive"] button',
      )!;
      const mobile = element.querySelector<HTMLButtonElement>(
        'button[aria-label="Arhivirane rezervacije"]',
      )!;

      mobile.click();
      await settle();
      expectClassReservationsRequest({ showOnlyDeletedReservations: 'true' }).flush(firstPage);
      await settle();
      await fixture.whenStable();
      expect(mobile.getAttribute('aria-pressed')).toBe('true');
      expect(mobile.className).toContain('border-amber-500');

      desktop.click();
      await settle();
      expect(store.params.showOnlyDeletedReservations()).toBe(false);
    });

    it('the deleted students button shows reservations of deleted students', async () => {
      element.querySelector<HTMLButtonElement>('button[aria-label="Obrisani studenti"]')!.click();
      await settle();

      expectClassReservationsRequest({ showOnlyDeletedStudents: 'true' }).flush(firstPage);
      await settle();
    });

    it('opens the create page from the add button', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

      element
        .querySelector<HTMLButtonElement>('button[aria-label="Dodaj rezervaciju časova"]')!
        .click();

      expect(navigate).toHaveBeenCalledWith(['admin/classes/create']);
    });

    it('loads the next page and dims the cards while it loads', async () => {
      const [previous, next] = pageButtons();
      expect(previous.disabled).toBe(true);

      next.click();
      await settle();
      fixture.detectChanges();
      expect(cards()[0].style.opacity).toBe('0.5');

      expectClassReservationsRequest({ pageNumber: '2' }).flush(
        createPagedClassReservations([createClassReservation({ id: 3 })], {
          totalCount: 3,
          pageNumber: 2,
          totalPages: 2,
          hasPreviousPage: true,
        }),
      );
      await settle();
      await fixture.whenStable();

      expect(cards().length).toBe(1);
      expect(cards()[0].style.opacity).toBe('');
      expect(pageButtons()[1].disabled).toBe(true);
    });
  });
});
