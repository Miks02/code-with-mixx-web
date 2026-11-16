import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NextClass } from '@features/classes/models/classes-summary';
import { inDays } from '@features/classes/testing/class-test-utils';
import { NextClassCard } from './next-class-card';

describe('NextClassCard', () => {
  let fixture: ComponentFixture<NextClassCard>;
  let element: HTMLElement;

  const nextClass = (overrides: Partial<NextClass> = {}): NextClass => ({
    reservationId: 1,
    studentFullName: 'Marko Jovanović',
    startsAt: inDays(3).toISOString(),
    university: null,
    subjectName: 'Baze podataka',
    ...overrides,
  });
  const render = async (value: NextClass | null | undefined, isPending = false) => {
    fixture.componentRef.setInput('nextClass', value);
    fixture.componentRef.setInput('isPending', isPending);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NextClassCard] }).compileComponents();
    fixture = TestBed.createComponent(NextClassCard);
    element = fixture.nativeElement;
  });

  it('shows skeletons while the summary loads', async () => {
    await render(undefined, true);
    expect(element.querySelector('app-skeleton')).not.toBeNull();
    expect(element.textContent).not.toContain('Nema zakazanih časova.');
  });

  it('says there is nothing scheduled when there is no next class', async () => {
    await render(null);
    expect(element.textContent).toContain('Nema zakazanih časova.');
  });

  it.each([
    [0, 'Danas'],
    [1, 'Sutra'],
    [5, 'Za 5 dana'],
  ])('a class in %i days is labeled "%s"', async (days, label) => {
    await render(nextClass({ startsAt: inDays(days, 23, 30).toISOString() }));
    expect(element.textContent).toContain(label);
  });

  it('a class that already started today is still labeled "Danas"', async () => {
    await render(nextClass({ startsAt: inDays(0, 0, 1).toISOString() }));
    expect(element.textContent).toContain('Danas');
  });

  it('shows the university only when the student has one', async () => {
    await render(nextClass({ university: 'ETF' }));
    expect(element.textContent).toContain('ETF');

    await render(nextClass({ university: null }));
    expect(element.querySelectorAll('ng-icon[name="faSolidBuildingColumns"]').length).toBe(0);
  });
});
