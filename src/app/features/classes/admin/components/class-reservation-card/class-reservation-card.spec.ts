import { ComponentFixture, TestBed } from '@angular/core/testing';
import { priceConverter } from '@core/utilities/price-helpers';
import { ReservationStatus } from '@features/reservations';
import { ClassReservationItem } from '@features/classes/models/class-reservation-item';
import {
  createClassItem,
  createClassReservation,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationCard } from './class-reservation-card';

describe('ClassReservationCard', () => {
  let fixture: ComponentFixture<ClassReservationCard>;
  let element: HTMLElement;
  let selected: (ClassReservationItem | undefined)[];

  const button = () => element.querySelector<HTMLButtonElement>('button')!;
  const render = async (overrides: Partial<ClassReservationItem> = {}, isSelected = false) => {
    fixture.componentRef.setInput('reservation', createClassReservation(overrides));
    fixture.componentRef.setInput('isSelected', isSelected);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ClassReservationCard] }).compileComponents();
    fixture = TestBed.createComponent(ClassReservationCard);
    element = fixture.nativeElement;
    selected = [];
    fixture.componentInstance.selected.subscribe((reservation) => selected.push(reservation));
  });

  it('uses the first letters of the first two names as initials', async () => {
    await render({ studentFullName: '  ana   marija jovanović ' });
    expect(element.textContent).toContain('AM');
  });

  it('lists each subject once even when several classes share it', async () => {
    await render({
      classes: [
        createClassItem({ id: 1, subjectName: 'Baze podataka' }),
        createClassItem({ id: 2, subjectName: 'Web programiranje' }),
        createClassItem({ id: 3, subjectName: 'Baze podataka' }),
      ],
    });
    expect(element.textContent).toContain('Baze podataka, Web programiranje');
    expect(element.textContent).not.toContain('Web programiranje, Baze podataka');
  });

  it('shows the number of classes, the price and what was paid', async () => {
    await render({
      classes: [createClassItem({ id: 1 }), createClassItem({ id: 2 })],
      totalPrice: 2600,
      paidAmount: 1300,
    });

    expect(element.textContent).toMatch(/Časovi\s*2/);
    expect(element.textContent).toContain(priceConverter(2600));
    expect(element.textContent).toContain(priceConverter(1300));
  });

  it('selects on click and asks to clear the selection when it is already selected', async () => {
    await render();
    button().click();
    expect(selected[0]?.id).toBe(1);

    await render({}, true);
    button().click();
    expect(selected[1]).toBeUndefined();
  });

  it('uses the status color, and a stronger one when selected', async () => {
    await render({ reservationStatus: ReservationStatus.Cancelled });
    expect(button().className).toContain('bg-red-700/30');

    await render({ reservationStatus: ReservationStatus.Cancelled }, true);
    expect(button().className).toContain('bg-red-600/50');
  });
});
