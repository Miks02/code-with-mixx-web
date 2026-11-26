import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import {
  createProjectReservationDetails,
  expectReservationDetailsRequest,
  flushLookups,
  flushReservationDetailsRefetch,
  provideReservationRoute,
} from '@features/projects/testing/project-test-utils';
import { ProjectReservationUpdatePage } from './project-reservation-update-page';

describe('ProjectReservationUpdatePage', () => {
  let fixture: ComponentFixture<ProjectReservationUpdatePage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const setup = async (reservationId: string) => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationUpdatePage],
      providers: [provideReservationRoute(reservationId), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationUpdatePage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await flushLookups();
  };

  afterEach(() => {
    flushReservationDetailsRefetch();
    http.verify();
  });

  it('shows the loaded reservation in every part of the form', async () => {
    await setup('7');
    expectReservationDetailsRequest().flush(createProjectReservationDetails({ paidAmount: 3000 }));
    await settle();
    await fixture.whenStable();

    expect(element.querySelector('app-student-selection')?.textContent).toContain(
      'Jelena Petrović',
    );
    expect(element.querySelector<HTMLInputElement>('#reservation-total-price')?.value).toBe('9000');
    expect(element.querySelector<HTMLInputElement>('#reservation-paid-amount')?.value).toBe('3000');
    expect(element.querySelector<HTMLTextAreaElement>('#reservationDescription')?.value).toBe(
      'Seminarski iz baza',
    );
    expect(element.querySelector<HTMLSelectElement>('#project-subject-0')?.value).toBe('1');
  });

  it('shows "Rezervacija nije pronađena." instead of the form for a missing reservation', async () => {
    await setup('7');
    expectReservationDetailsRequest().flush(createProblemDetails('Reservation.NotFound'), {
      status: 404,
      statusText: 'Not Found',
    });
    await settle();
    await fixture.whenStable();

    expect(element.textContent).toContain('Rezervacija nije pronađena.');
    expect(element.querySelector('app-reservation-summary')).toBeNull();
  });

  it('shows the not found state right away for a malformed id', async () => {
    await setup('abc');
    await fixture.whenStable();

    expect(element.textContent).toContain('Rezervacija nije pronađena.');
    expect(element.querySelector('app-project-reservation-list-form')).toBeNull();
  });
});
