import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import {
  createPagedReservations,
  createStudentDetails,
  createStudentProfile,
  createStudentReservation,
  createStudentStats,
  expectStudentDetailsRequest,
  flushStudentDetails,
  flushStudentsLookup,
} from '@features/students/testing/student-test-utils';
import { StudentDetailsPage } from './student-details-page';

describe('StudentDetailsPage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  const root = () => harness.routeNativeElement!;
  const getButtonByLabel = (label: string) =>
    root().querySelector<HTMLButtonElement>(`app-button[aria-label="${label}"] button`)!;
  const statsValues = () =>
    Array.from(root().querySelectorAll('app-stats-card p.text-3xl')).map((p) =>
      p.textContent?.trim(),
    );

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'admin/students', children: [] },
          { path: 'admin/students/details/:id', component: StudentDetailsPage },
        ]),
        provideHttpTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/students/details/student-1', StudentDetailsPage);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the student from the url', async () => {
    await flushStudentDetails();
    harness.detectChanges();

    expect(root().querySelector('app-student-profile h1')?.textContent).toContain(
      'Marko Jovanović',
    );
  });

  it('shows the reservation stats, with class and project reservation counts', async () => {
    await flushStudentDetails(
      createStudentDetails({
        stats: createStudentStats({
          totalReservations: 5,
          classReservations: 3,
          projectReservations: 2,
          totalClasses: 9,
          totalProjects: 2,
          overdueReservations: 1,
        }),
      }),
    );
    harness.detectChanges();

    expect(statsValues()).toEqual(['5', '9', '2', '1']);
    expect(root().textContent).toContain('U 3 rezervacija');
    expect(root().textContent).toContain('U 2 rezervacija');
  });

  describe('opening another student while already on the details page', () => {
    // The header search navigates here; the router reuses the same page instance.
    const openJelena = async () => {
      await flushStudentDetails(
        createStudentDetails({
          reservations: createPagedReservations([createStudentReservation()], {
            totalPages: 2,
            hasNextPage: true,
          }),
        }),
      );
      harness.detectChanges();
      await harness.navigateByUrl('/admin/students/details/student-2');
      await settle();
    };

    it('loads the new student from the url', async () => {
      await openJelena();

      expectStudentDetailsRequest({}, 'student-2').flush(
        createStudentDetails({
          student: createStudentProfile({
            id: 'student-2',
            firstName: 'Jelena',
            lastName: 'Petrović',
          }),
        }),
      );
      await settle();
      harness.detectChanges();

      expect(root().querySelector('app-student-profile h1')?.textContent).toContain(
        'Jelena Petrović',
      );
    });

    it('does not show the previous student while the new one loads', async () => {
      await openJelena();
      harness.detectChanges();

      expect(root().querySelector('app-student-profile h1')).toBeNull();
      expect(root().querySelectorAll('app-student-profile app-skeleton').length).toBeGreaterThan(0);

      expectStudentDetailsRequest({}, 'student-2').flush(createStudentDetails());
      await settle();
    });

    it('starts the new student on the first page of all reservations', async () => {
      await flushStudentDetails(
        createStudentDetails({
          reservations: createPagedReservations([createStudentReservation()], {
            totalPages: 2,
            hasNextPage: true,
          }),
        }),
      );
      harness.detectChanges();
      getButtonByLabel('Sledeća strana').click();
      await settle();
      expectStudentDetailsRequest({ pageNumber: '2' }).flush(
        createStudentDetails({
          reservations: createPagedReservations([], { pageNumber: 2, totalPages: 2 }),
        }),
      );
      await settle();

      await harness.navigateByUrl('/admin/students/details/student-2');
      await settle();

      expectStudentDetailsRequest({ pageNumber: '1', reservationType: null }, 'student-2').flush(
        createStudentDetails(),
      );
      await settle();
    });
  });

  it('goes back to the students list when the details fail to load', async () => {
    await flushStudentsLookup();
    expectStudentDetailsRequest().flush(
      createProblemDetails('General.InternalServerError', { status: 500 }),
      { status: 500, statusText: 'Internal Server Error' },
    );
    await settle();

    expect(TestBed.inject(Router).url).toBe('/admin/students');
  });

  it('shows the not found state instead of the layout for Student.NotFound', async () => {
    await flushStudentsLookup();
    expectStudentDetailsRequest().flush(createProblemDetails('Student.NotFound'), {
      status: 404,
      statusText: 'Not Found',
    });
    await settle();
    harness.detectChanges();

    expect(root().textContent).toContain('Student nije pronađen.');
    expect(root().querySelector('app-student-profile')).toBeNull();
    expect(root().querySelector('app-student-reservations-list')).toBeNull();
  });
});
