import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ClassReservationsSummary } from '@features/analytics/student/models/class-reservations-summary';
import {
  createClassReservationItem,
  createClassReservationsSummary,
} from '@features/analytics/testing/analytics-test-utils';
import { ReservationStatus } from '@features/reservations';
import { Slider } from '@shared/components/slider/slider';
import { ClassReservations } from './class-reservations';

describe('ClassReservations', () => {
  let fixture: ComponentFixture<ClassReservations>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClassReservations],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ClassReservations);
  });

  async function render(summary: ClassReservationsSummary | undefined) {
    fixture.componentRef.setInput('summary', summary);
    await fixture.whenStable();
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function sliders(): Slider[] {
    return fixture.debugElement
      .queryAll(By.directive(Slider))
      .map((el) => el.componentInstance as Slider);
  }

  function badges(): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('span.rounded-full')).map(
      (span) => span.textContent!.trim(),
    );
  }

  it('shows zeros and the empty state while the summary is not loaded', async () => {
    await render(undefined);

    expect(text()).toContain('Broj rezervacija0');
    expect(text()).toContain('Ukupno sati0 h');
    expect(text()).toContain('Još nemaš rezervisanih časova.');
    expect(sliders().length).toBe(0);
  });

  it('shows the empty state when the student has no reservations', async () => {
    await render(
      createClassReservationsSummary({ total: 0, totalHours: 0, classReservationItems: [] }),
    );

    expect(text()).toContain('Još nemaš rezervisanih časova.');
    expect(sliders().length).toBe(0);
  });

  it('formats total hours with a Serbian decimal comma', async () => {
    await render(createClassReservationsSummary({ totalHours: 19.5 }));

    expect(text()).toContain('19,5 h');
  });

  it('renders a card with a status badge for every reservation status', async () => {
    await render(
      createClassReservationsSummary({
        total: 3,
        classReservationItems: [
          createClassReservationItem({
            reservationId: 1042,
            reservationStatus: ReservationStatus.Confirmed,
          }),
          createClassReservationItem({
            reservationId: 1057,
            reservationStatus: ReservationStatus.Completed,
          }),
          createClassReservationItem({
            reservationId: 1063,
            reservationStatus: ReservationStatus.Cancelled,
          }),
        ],
      }),
    );

    expect(text()).not.toContain('Još nemaš rezervisanih časova.');
    expect(text()).toContain('Rezervacija #1042');
    expect(text()).toContain('Rezervacija #1057');
    expect(badges()).toEqual(['Potvrđena', 'Završena', 'Otkazana']);
  });

  it('fills the slider with completed classes out of scheduled ones and keeps it read-only', async () => {
    await render(
      createClassReservationsSummary({
        classReservationItems: [
          createClassReservationItem({ completedClassesCount: 8, scheduledClassesCount: 10 }),
        ],
      }),
    );

    const [slider] = sliders();
    expect(slider.value()).toBe(8);
    expect(slider.min()).toBe(0);
    expect(slider.max()).toBe(10);
    expect(slider.fillRatio()).toBe(0.8);
    expect(slider.disabled()).toBe(true);
    expect(text()).toContain('8 / 10');
  });
});
