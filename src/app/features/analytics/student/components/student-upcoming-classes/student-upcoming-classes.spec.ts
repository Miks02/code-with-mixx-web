import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { StudentUpcomingClass } from '@features/analytics/student/models/student-upcoming-class';
import { createStudentUpcomingClass } from '@features/analytics/testing/analytics-test-utils';
import { DateCard } from '@shared/components/date-card/date-card';
import { StudentUpcomingClasses } from './student-upcoming-classes';

describe('StudentUpcomingClasses', () => {
  let fixture: ComponentFixture<StudentUpcomingClasses>;

  const webProgramming = createStudentUpcomingClass({
    reservationId: 1,
    subjectName: 'Web programiranje',
    startsAt: '2026-11-26T10:00:00Z',
    endsAt: '2026-11-26T11:00:00Z',
  });
  const databases = createStudentUpcomingClass({
    reservationId: 2,
    subjectName: 'Baze podataka',
    startsAt: '2026-11-27T12:00:00Z',
    endsAt: '2026-11-27T13:00:00Z',
  });
  const algorithms = createStudentUpcomingClass({
    reservationId: 3,
    subjectName: 'Algoritmi i strukture podataka',
    startsAt: '2026-11-28T14:00:00Z',
    endsAt: '2026-11-28T15:00:00Z',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StudentUpcomingClasses],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(StudentUpcomingClasses);
  });

  async function render(classes: StudentUpcomingClass[]) {
    fixture.componentRef.setInput('upcomingClasses', classes);
    await fixture.whenStable();
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function upcomingCount(): string | undefined {
    return fixture.nativeElement.querySelector('h3 span')?.textContent.trim();
  }

  function dateCards(variant: 'full' | 'compact'): DateCard[] {
    return fixture.debugElement
      .queryAll(By.directive(DateCard))
      .map((el) => el.componentInstance as DateCard)
      .filter((card) => card.variant() === variant);
  }

  it('shows the empty state and no date cards when there are no upcoming classes', async () => {
    await render([]);

    expect(text()).toContain('Trenutno nema predstojećih časova.');
    expect(text()).not.toContain('Predstojeći časovi');
    expect(fixture.debugElement.queryAll(By.directive(DateCard)).length).toBe(0);
  });

  it('shows the first class as the next class and lists only the remaining ones', async () => {
    await render([webProgramming, databases, algorithms]);

    const [nextCard] = dateCards('full');
    expect(dateCards('full').length).toBe(1);
    expect(nextCard.date()).toBe(webProgramming.startsAt);

    expect(dateCards('compact').map((card) => card.date())).toEqual([
      databases.startsAt,
      algorithms.startsAt,
    ]);
    expect(text().match(/Web programiranje/g)?.length).toBe(1);
    expect(upcomingCount()).toBe('2');
  });

  it('shows a single class as the next class with an empty list below it', async () => {
    await render([webProgramming]);

    expect(dateCards('full').map((card) => card.date())).toEqual([webProgramming.startsAt]);
    expect(dateCards('compact').length).toBe(0);
    expect(upcomingCount()).toBe('0');
    expect(text()).not.toContain('Trenutno nema predstojećih časova.');
  });

  it('switches from the empty state to the class list when data arrives', async () => {
    await render([]);
    await render([webProgramming, databases]);

    expect(text()).not.toContain('Trenutno nema predstojećih časova.');
    expect(dateCards('full').map((card) => card.date())).toEqual([webProgramming.startsAt]);
    expect(dateCards('compact').map((card) => card.date())).toEqual([databases.startsAt]);
  });
});
