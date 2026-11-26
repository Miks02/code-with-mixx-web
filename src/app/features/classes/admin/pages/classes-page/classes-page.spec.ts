import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { AdminClassStore } from '@features/classes/admin/stores/admin-class-store';
import {
  CLASS_RESERVATIONS_URL,
  createClassesSummary,
  createClassReservation,
  createPagedClassReservations,
  expectClassReservationsRequest,
  flushClassesSummary,
} from '@features/classes/testing/class-test-utils';
import { ClassesPage } from './classes-page';

describe('ClassesPage', () => {
  let fixture: ComponentFixture<ClassesPage>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminClassStore>;
  let http: HttpTestingController;

  const statsValues = () =>
    Array.from(element.querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );
  const cards = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-class-reservation-card button'));
  const detailsName = () =>
    element.querySelector('app-class-reservation-details h2')?.textContent?.trim();

  const setup = async (summary = createClassesSummary()) => {
    await TestBed.configureTestingModule({
      imports: [ClassesPage],
      providers: [provideRouter([]), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesPage);
    element = fixture.nativeElement;
    store = fixture.debugElement.injector.get(AdminClassStore);
    http = TestBed.inject(HttpTestingController);

    await flushClassesSummary(summary);
    await fixture.whenStable();
  };

  afterEach(() => http.verify());

  describe('with reservations', () => {
    beforeEach(() =>
      setup(
        createClassesSummary({
          totalClassesCount: 12,
          scheduledClassesCount: 5,
          heldClassesCount: 4,
          cancelledClassesCount: 3,
          nextClassItem: {
            reservationId: 1,
            studentFullName: 'Marko Jovanović',
            startsAt: '2030-01-01T10:00:00Z',
            university: 'ETF',
            subjectName: 'Baze podataka',
            className: 'Normalizacija',
          },
          reservations: createPagedClassReservations(
            [
              createClassReservation({ id: 1 }),
              createClassReservation({ id: 2, studentFullName: 'Jelena Petrović' }),
            ],
            { totalCount: 3, totalPages: 2, hasNextPage: true },
          ),
        }),
      ),
    );

    it('loads the first page only through the summary and shows its counts', () => {
      http.expectNone((req) => req.url === CLASS_RESERVATIONS_URL);
      expect(cards().length).toBe(2);
      expect(statsValues()).toEqual(['12', '5', '4', '3']);
    });

    it('shows the next class from the summary', () => {
      const nextClass = element.querySelector('app-next-class-card')!.textContent;
      expect(nextClass).toContain('Marko Jovanović');
      expect(nextClass).toContain('Baze podataka');
      expect(nextClass).toContain('ETF');
    });

    it('shows the first reservation in the details and follows the clicked one', async () => {
      expect(detailsName()).toBe('Marko Jovanović');

      cards()[1].click();
      await fixture.whenStable();

      expect(detailsName()).toBe('Jelena Petrović');
    });

    it('sends a single paged request (and no summary) when the page changes', async () => {
      store.nextPage();
      await settle();

      expectClassReservationsRequest({ pageNumber: '2' }).flush(
        createPagedClassReservations([createClassReservation({ id: 3 })], { pageNumber: 2 }),
      );
      await settle();

      http.expectNone((req) => req.url.endsWith('/summary'));
    });

    it('gets its own store instance', () => {
      expect(() => TestBed.inject(AdminClassStore)).toThrow();
    });
  });

  it('says there are no scheduled classes when the summary has none', async () => {
    await setup(createClassesSummary({ nextClassItem: null }));

    expect(element.querySelector('app-next-class-card')!.textContent).toContain(
      'Nema zakazanih časova.',
    );
  });
});
