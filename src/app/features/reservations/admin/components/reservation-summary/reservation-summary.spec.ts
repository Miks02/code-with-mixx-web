import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { getButton } from '@core/testing/test-utils';
import { priceConverter } from '@core/utilities/price-helpers';
import { ReservationCheck } from '@features/reservations/models/reservation-check';
import { ReservationSummary } from './reservation-summary';

@Component({
  imports: [ReservationSummary],
  template: `
    <app-reservation-summary
      [totalPrice]="totalPrice()"
      [itemsTotal]="itemsTotal()"
      [totalPaid]="totalPaid()"
      [reservedAt]="reservationForm.reservedAt"
      [description]="reservationForm.description"
      [checks]="checks()"
      [canSave]="canSave()"
      [isSaving]="isSaving()"
      (saved)="saved()"
      (formReset)="formReset()"
    />
  `,
})
class SummaryHost {
  totalPrice = signal(0);
  itemsTotal = signal(0);
  totalPaid = signal(0);
  checks = signal<ReservationCheck[]>([]);
  canSave = signal(true);
  isSaving = signal(false);
  reservationForm = form(signal({ reservedAt: '', description: '' }));
  saved = vi.fn();
  formReset = vi.fn();
}

describe('ReservationSummary', () => {
  let fixture: ComponentFixture<SummaryHost>;
  let host: SummaryHost;
  let element: HTMLElement;

  const stats = () =>
    Object.fromEntries(
      Array.from(element.querySelectorAll('.grid > div')).map((stat) => [
        stat.querySelector('p.text-sm')?.textContent?.trim(),
        stat.querySelector('p.text-lg')?.textContent?.trim(),
      ]),
    );
  const paymentBadge = () => element.querySelector('app-badge')?.textContent?.trim();
  const checks = () =>
    Array.from(element.querySelectorAll('li')).map((check) => check.textContent?.trim());
  const saveButton = () => getButton(element, 'Sačuvaj')!;

  const render = async (values: {
    totalPrice?: number;
    itemsTotal?: number;
    totalPaid?: number;
  }) => {
    host.totalPrice.set(values.totalPrice ?? 0);
    host.itemsTotal.set(values.itemsTotal ?? 0);
    host.totalPaid.set(values.totalPaid ?? 0);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SummaryHost] }).compileComponents();

    fixture = TestBed.createComponent(SummaryHost);
    host = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  describe('prices', () => {
    it('shows the discount as the share of the items total that was taken off', async () => {
      await render({ totalPrice: 9000, itemsTotal: 12000 });

      expect(stats()).toEqual({
        'Ukupna cena': priceConverter(9000),
        Preostalo: priceConverter(9000),
        Popust: '25%',
      });
    });

    it('rounds the discount to two decimals', async () => {
      await render({ totalPrice: 2000, itemsTotal: 3000 });
      expect(stats()['Popust']).toBe('33.33%');
    });

    it('shows no discount when the total is higher than the items total', async () => {
      await render({ totalPrice: 8000, itemsTotal: 6000 });
      expect(stats()['Popust']).toBeUndefined();
    });

    it('shows a free reservation instead of a price of zero', async () => {
      await render({ totalPrice: 0, itemsTotal: 3000 });

      expect(stats()['Ukupna cena']).toBe('Besplatno');
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Čeka uplatu');
    });
  });

  describe('payments', () => {
    it('a partly paid reservation shows what was paid and what remains', async () => {
      await render({ totalPrice: 9000, itemsTotal: 9000, totalPaid: 3000 });

      expect(stats()['Plaćeno']).toBe(priceConverter(3000));
      expect(stats()['Preostalo']).toBe(priceConverter(6000));
      expect(paymentBadge()).toBe('Delimično plaćeno');
    });

    it('paying more than the price shows the extra as a bonus and nothing remaining', async () => {
      await render({ totalPrice: 9000, itemsTotal: 9000, totalPaid: 10000 });

      expect(stats()['Bonus']).toBe(priceConverter(1000));
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Plaćeno');
    });

    it('lowering the price below what was paid turns the difference into a bonus', async () => {
      await render({ totalPrice: 9000, itemsTotal: 9000, totalPaid: 9000 });
      expect(stats()['Bonus']).toBeUndefined();

      host.totalPrice.set(8000);
      await fixture.whenStable();

      expect(stats()['Bonus']).toBe(priceConverter(1000));
    });
  });

  it('shows the valid or the invalid label of every check', async () => {
    host.checks.set([
      { isValid: true, validLabel: 'Student je izabran', invalidLabel: 'Student nije izabran' },
      { isValid: false, validLabel: 'Ima predmet', invalidLabel: 'Nema predmet' },
    ]);
    await fixture.whenStable();

    expect(checks()).toEqual(['Student je izabran', 'Nema predmet']);
  });

  it('cannot be saved while the form is invalid or a save is running', async () => {
    expect(saveButton().disabled).toBe(false);

    host.canSave.set(false);
    await fixture.whenStable();
    expect(saveButton().disabled).toBe(true);

    host.canSave.set(true);
    host.isSaving.set(true);
    await fixture.whenStable();
    expect(saveButton().disabled).toBe(true);
  });

  it('reports the save and reset clicks to the page', async () => {
    saveButton().click();
    getButton(element, 'Poništi formu')!.click();

    expect(host.saved).toHaveBeenCalledTimes(1);
    expect(host.formReset).toHaveBeenCalledTimes(1);
  });
});
