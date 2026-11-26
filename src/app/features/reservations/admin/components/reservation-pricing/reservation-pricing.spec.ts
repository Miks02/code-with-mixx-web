import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, min } from '@angular/forms/signals';
import { typeInto } from '@core/testing/test-utils';
import { ReservationStatus } from '@features/reservations/models/reservation-status';
import { ReservationPricing } from './reservation-pricing';

@Component({
  imports: [ReservationPricing],
  template: `
    <app-reservation-pricing
      [reservationStatus]="reservationForm.reservationStatus"
      [totalPrice]="reservationForm.totalPrice"
      [itemsTotal]="itemsTotal()"
      [useItemsSum]="useItemsSum()"
      [totalPaid]="totalPaid()"
      sumLabel="Zbir stavki"
      sumHint="Računa se iz stavki."
      (useItemsSumChanged)="useItemsSumChanged($event)"
    />
  `,
})
class PricingHost {
  model = signal<{ reservationStatus: ReservationStatus; totalPrice: number | null }>({
    reservationStatus: ReservationStatus.Confirmed,
    totalPrice: 5000,
  });
  reservationForm = form(this.model, (path) => {
    min(path.totalPrice, 0, { message: 'Cena mora biti najmanje 0 RSD.' });
  });
  itemsTotal = signal(7500);
  useItemsSum = signal(false);
  totalPaid = signal<number | undefined>(undefined);
  useItemsSumChanged = vi.fn();
}

describe('ReservationPricing', () => {
  let fixture: ComponentFixture<PricingHost>;
  let host: PricingHost;
  let element: HTMLElement;

  const sumToggle = () => element.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  const totalInput = () => element.querySelector<HTMLInputElement>('#reservation-total-price')!;
  const paidInput = () => element.querySelector<HTMLInputElement>('#reservation-paid-amount');
  const totalError = () => element.querySelector('p.text-red-400')?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PricingHost] }).compileComponents();

    fixture = TestBed.createComponent(PricingHost);
    host = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('edits the total price in the form while the sum is off', async () => {
    expect(totalInput().disabled).toBe(false);
    expect(totalInput().value).toBe('5000');

    typeInto(totalInput(), '6000');
    await fixture.whenStable();

    expect(host.model().totalPrice).toBe(6000);
  });

  it('shows the items total as read only while the sum is on', async () => {
    host.useItemsSum.set(true);
    await fixture.whenStable();

    expect(sumToggle().checked).toBe(true);
    expect(totalInput().disabled).toBe(true);
    expect(totalInput().value).toBe('7500');
    expect(element.textContent).toContain('Računa se iz stavki.');
  });

  it('reports the sum toggle to the page', () => {
    sumToggle().checked = true;
    sumToggle().dispatchEvent(new Event('change'));

    expect(host.useItemsSumChanged).toHaveBeenCalledWith(true);
  });

  it('shows the total price error from the form', async () => {
    typeInto(totalInput(), '-100');
    await fixture.whenStable();

    expect(totalError()).toBe('Cena mora biti najmanje 0 RSD.');
  });

  it('picking a status writes it into the form', async () => {
    const cancelled = Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Otkazana'),
    )!;

    cancelled.click();
    await fixture.whenStable();

    expect(host.model().reservationStatus).toBe(ReservationStatus.Cancelled);
    expect(cancelled.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the paid amount as read only only when it is known', async () => {
    expect(paidInput()).toBeNull();

    host.totalPaid.set(3000);
    await fixture.whenStable();

    expect(paidInput()?.value).toBe('3000');
    expect(paidInput()?.disabled).toBe(true);
  });
});
