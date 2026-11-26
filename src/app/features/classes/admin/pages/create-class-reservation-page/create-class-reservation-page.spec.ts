import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { getButton, provideHttpTesting, settle } from '@core/testing/test-utils';
import {
  CLASS_RESERVATIONS_URL,
  flushLookups,
  provideReservationRoute,
} from '@features/classes/testing/class-test-utils';
import { CreateClassReservationPage } from './create-class-reservation-page';

describe('CreateClassReservationPage', () => {
  let fixture: ComponentFixture<CreateClassReservationPage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const studentButton = (name: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-student-selection button')).find(
      (button) => button.textContent?.includes(name),
    )!;
  const checks = () =>
    Array.from(element.querySelectorAll('app-reservation-summary li')).map((check) =>
      check.textContent?.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateClassReservationPage],
      providers: [provideReservationRoute(null), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClassReservationPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await flushLookups();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('starts empty, without loading any reservation and without the paid amount', () => {
    http.expectNone((req) => req.url.startsWith(`${CLASS_RESERVATIONS_URL}/`));
    expect(element.querySelector('#reservation-paid-amount')).toBeNull();
    expect(element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
    expect(checks()).toContain('Student nije izabran');
  });

  it('creates a reservation for the student and subject picked on the page', async () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    studentButton('Jelena Petrović').click();
    await fixture.whenStable();
    const subject = element.querySelector<HTMLSelectElement>('#class-subject-0')!;
    subject.value = '1';
    subject.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(checks()).toContain('Student je izabran');
    expect(checks()).toContain('Svi časovi imaju izabrani predmet.');

    getButton(element, 'Sačuvaj')!.click();
    await settle();

    const request = http.expectOne(
      (req) => req.url === CLASS_RESERVATIONS_URL && req.method === 'POST',
    );
    expect(request.request.body.studentId).toBe('student-2');
    expect(request.request.body.totalPrice).toBeNull();
    expect(request.request.body.classes[0].subjectId).toBe(1);
    request.flush(null);
    await settle();

    expect(navigateByUrl).toHaveBeenCalledWith('/admin/classes');
  });
});
