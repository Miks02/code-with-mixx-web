import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createProblemDetails, provideHttpTesting, settle } from '@core/testing/test-utils';
import { dateTimeInputValue } from '@core/utilities/date-helpers';
import {
  createClassReservationDetails,
  expectReservationDetailsRequest,
  flushLookups,
  flushReservationDetailsRefetch,
  provideReservationRoute,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationUpdatePage } from './class-reservation-update-page';

describe('ClassReservationUpdatePage', () => {
  let fixture: ComponentFixture<ClassReservationUpdatePage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const setup = async (reservationId: string) => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationUpdatePage],
      providers: [provideReservationRoute(reservationId), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationUpdatePage);
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
    expectReservationDetailsRequest().flush(createClassReservationDetails({ paidAmount: 1300 }));
    await settle();
    await fixture.whenStable();

    expect(element.querySelector('app-student-selection')?.textContent).toContain(
      'Jelena Petrović',
    );
    expect(element.querySelector<HTMLInputElement>('#reservation-total-price')?.value).toBe('2600');
    expect(element.querySelector<HTMLInputElement>('#reservation-paid-amount')?.value).toBe('1300');
    expect(element.querySelector<HTMLTextAreaElement>('#reservationDescription')?.value).toBe(
      'Priprema za kolokvijum',
    );
    expect(element.querySelector<HTMLSelectElement>('#class-subject-1')?.value).toBe('2');
    expect(element.querySelector<HTMLInputElement>('#class-start-0')?.value).toBe(
      dateTimeInputValue(new Date('2026-10-05T10:00:00Z')),
    );
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
    expect(element.querySelector('app-class-reservation-list-form')).toBeNull();
  });
});
