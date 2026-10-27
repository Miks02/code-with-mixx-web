import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../../../../core/services/toast-service';
import { priceConverter } from '../../../../../core/utilities/price-helpers';
import { PaymentType } from '../../../models/payment-type';
import { PaymentService } from '../../../services/payment-service';
import { SubtractPaymentModal } from './subtract-payment-modal';

describe('SubtractPaymentModal', () => {
  let component: SubtractPaymentModal;
  let fixture: ComponentFixture<SubtractPaymentModal>;

  const subtractPaymentMutation = {
    mutateAsync: vi.fn(),
    isPending: signal(false),
  };
  const toastService = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  function setInputs(totalPrice: number, paidAmount: number) {
    fixture.componentRef.setInput('reservationId', 7);
    fixture.componentRef.setInput('totalPrice', totalPrice);
    fixture.componentRef.setInput('paidAmount', paidAmount);
    fixture.detectChanges();
  }

  function setAmount(amount: number) {
    component.paymentModel.update((model) => ({ ...model, amount }));
    fixture.detectChanges();
  }

  function setNote(note = 'Storniranje pogrešno unete uplate.') {
    component.paymentModel.update((model) => ({ ...model, note }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SubtractPaymentModal],
      providers: [
        { provide: PaymentService, useValue: { subtractPaymentMutation } },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtractPaymentModal);
    component = fixture.componentInstance;
    setInputs(10000, 6000);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('summary', () => {
    it('should show total price, paid and remaining amount', () => {
      expect(component.summary()).toEqual([
        { label: 'Ukupna cena', value: priceConverter(10000) },
        { label: 'Plaćeno', value: priceConverter(6000) },
        { label: 'Preostalo', value: priceConverter(4000) },
      ]);
    });

    it('should add a bonus card when paid amount exceeds total price', () => {
      setInputs(10000, 12000);

      expect(component.currentBonus()).toBe(2000);
      expect(component.remainingAmount()).toBe(0);
      expect(component.summary()).toContainEqual({ label: 'Bonus', value: priceConverter(2000) });
    });
  });

  describe('amounts after subtract', () => {
    it('should reduce paid amount and increase remaining amount', () => {
      setAmount(1500);

      expect(component.paidAfterSubtract()).toBe(4500);
      expect(component.remainingAfterSubtract()).toBe(5500);
      expect(component.bonusAfterSubtract()).toBe(0);
      expect(component.exceedsPaidAmount()).toBe(false);
    });

    it('should not go below zero when amount exceeds paid amount', () => {
      setAmount(8000);

      expect(component.exceedsPaidAmount()).toBe(true);
      expect(component.paidAfterSubtract()).toBe(0);
      expect(component.remainingAfterSubtract()).toBe(10000);
    });

    it('should reduce the bonus first when reservation is overpaid', () => {
      setInputs(10000, 12000);
      setAmount(500);

      expect(component.bonusAfterSubtract()).toBe(1500);
      expect(component.remainingAfterSubtract()).toBe(0);
      expect(fixture.nativeElement.textContent).toContain('Preostali bonus');
    });
  });

  describe('template hint', () => {
    it('should show the remaining amount after subtract', () => {
      setAmount(1000);

      expect(fixture.nativeElement.textContent).toContain('Nakon skidanja preostaje');
      expect(fixture.nativeElement.textContent).toContain((5000).toLocaleString('sr-RS'));
    });

    it('should warn when amount exceeds paid amount', () => {
      setAmount(7000);

      expect(fixture.nativeElement.textContent).toContain('Iznos je veći od uplaćenog');
    });

    it('should hide "Skini celu uplatu" when nothing is paid', () => {
      setInputs(10000, 0);

      expect(fixture.nativeElement.textContent).not.toContain('Skini celu uplatu');
    });
  });

  describe('validation', () => {
    it('should require amount of at least 1 RSD', () => {
      setAmount(0);

      expect(component.paymentForm.amount().errors()[0]?.message).toBe(
        'Iznos mora biti najmanje 1 RSD.',
      );
    });

    it('should not allow subtracting more than paid amount', () => {
      setAmount(6001);

      expect(component.paymentForm.amount().errors()[0]?.message).toBe(
        'Nije moguće skinuti više od ukupno uplaćenog iznosa.',
      );
    });

    it('should be valid for amount within paid amount', () => {
      setNote();
      setAmount(6000);

      expect(component.paymentForm().valid()).toBe(true);
    });
  });

  it('should fill the whole paid amount and mark field as touched', () => {
    component.fillPaidAmount();

    expect(component.paymentModel().amount).toBe(6000);
    expect(component.paymentForm.amount().touched()).toBe(true);
  });

  it('should emit closed on close', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onClose();

    expect(closedSpy).toHaveBeenCalledOnce();
  });

  describe('onSubmit', () => {
    let closedSpy: ReturnType<typeof vi.fn<() => void>>;

    beforeEach(() => {
      closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);
      setNote();
    });

    it('should subtract payment, show success toast and close', async () => {
      subtractPaymentMutation.mutateAsync.mockResolvedValue(undefined);
      setAmount(2000);

      await component.onSubmit();

      expect(subtractPaymentMutation.mutateAsync).toHaveBeenCalledWith({
        reservationId: 7,
        amount: 2000,
        transactionDate: new Date(component.paymentModel().transactionDate).toISOString(),
        note: 'Storniranje pogrešno unete uplate.',
        paymentType: PaymentType.reversal,
      });
      expect(toastService.showSuccess).toHaveBeenCalledWith(
        `Uplata od ${priceConverter(2000)} je uspešno skinuta.`,
      );
      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should show error toast and stay open when mutation fails', async () => {
      subtractPaymentMutation.mutateAsync.mockRejectedValue(new Error('fail'));
      setAmount(2000);

      await component.onSubmit();

      expect(toastService.showError).toHaveBeenCalled();
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should not call mutation when form is invalid', async () => {
      setAmount(9000);

      await component.onSubmit();

      expect(subtractPaymentMutation.mutateAsync).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();
    });
  });
});
