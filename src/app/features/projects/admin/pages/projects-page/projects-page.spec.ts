import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { AdminProjectStore } from '@features/projects/admin/stores/admin-project-store';
import {
  createPagedProjectReservations,
  createProjectReservation,
  createProjectsSummary,
  expectProjectReservationsRequest,
  flushProjectsSummary,
  PROJECT_RESERVATIONS_URL,
} from '@features/projects/testing/project-test-utils';
import { ProjectsPage } from './projects-page';

describe('ProjectsPage', () => {
  let fixture: ComponentFixture<ProjectsPage>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminProjectStore>;
  let http: HttpTestingController;

  const statsValues = () =>
    Array.from(element.querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );
  const cards = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-project-reservation-card button'));
  const detailsName = () =>
    element.querySelector('app-project-reservation-details h2')?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      providers: [provideRouter([]), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsPage);
    element = fixture.nativeElement;
    store = fixture.debugElement.injector.get(AdminProjectStore);
    http = TestBed.inject(HttpTestingController);

    await flushProjectsSummary(
      createProjectsSummary({
        totalProjects: 12,
        activeProjects: 5,
        pendingProjects: 4,
        completedProjects: 3,
        reservations: createPagedProjectReservations(
          [
            createProjectReservation({ id: 1 }),
            createProjectReservation({ id: 2, studentFullName: 'Jelena Petrović' }),
          ],
          { totalCount: 3, totalPages: 2, hasNextPage: true },
        ),
      }),
    );
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('loads the first page only through the summary and shows its counts', () => {
    http.expectNone((req) => req.url === PROJECT_RESERVATIONS_URL);
    expect(cards().length).toBe(2);
    expect(statsValues()).toEqual(['12', '5', '4', '3']);
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

    expectProjectReservationsRequest({ pageNumber: '2' }).flush(
      createPagedProjectReservations([createProjectReservation({ id: 3 })], { pageNumber: 2 }),
    );
    await settle();

    http.expectNone((req) => req.url.endsWith('/summary'));
  });

  it('gets its own store instance', () => {
    expect(() => TestBed.inject(AdminProjectStore)).toThrow();
  });
});
