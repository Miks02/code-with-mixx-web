import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { getButton, provideHttpTesting, settle } from '@core/testing/test-utils';
import {
  flushLookups,
  PROJECT_RESERVATIONS_URL,
  provideReservationRoute,
} from '@features/projects/testing/project-test-utils';
import { CreateProjectReservationPage } from './create-project-reservation-page';

describe('CreateProjectReservationPage', () => {
  let fixture: ComponentFixture<CreateProjectReservationPage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const studentButton = (name: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('app-student-selection button')).find(
      (button) => button.textContent?.includes(name),
    )!;
  const checks = () =>
    Array.from(element.querySelectorAll('app-project-reservation-summary li')).map((check) =>
      check.textContent?.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectReservationPage],
      providers: [provideReservationRoute(null), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectReservationPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await flushLookups();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('starts empty, without loading any reservation and without the paid amount', () => {
    http.expectNone((req) => req.url.startsWith(`${PROJECT_RESERVATIONS_URL}/`));
    expect(element.querySelector('#reservation-paid-amount')).toBeNull();
    expect(checks()).toContain('Student nije izabran');
  });

  it('creates a reservation for the student and subject picked on the page', async () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    studentButton('Jelena Petrović').click();
    await fixture.whenStable();
    const subject = element.querySelector<HTMLSelectElement>('#project-subject-0')!;
    subject.value = '1';
    subject.dispatchEvent(new Event('change'));
    const name = element.querySelector<HTMLInputElement>('#project-name-0')!;
    name.value = 'Biblioteka';
    name.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(checks()).toContain('Student je izabran');
    expect(checks()).toContain('Svi projekti imaju izabrani predmet.');

    getButton(element, 'Sačuvaj')!.click();
    await settle();

    const request = http.expectOne(
      (req) => req.url === PROJECT_RESERVATIONS_URL && req.method === 'POST',
    );
    expect(request.request.body.studentId).toBe('student-2');
    expect(request.request.body.projects[0].subjectId).toBe(1);
    expect(request.request.body.projects[0].name).toBe('Biblioteka');
    request.flush(null);
    await settle();

    expect(navigateByUrl).toHaveBeenCalledWith('/admin/projects');
  });
});
