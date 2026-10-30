import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RESERVATION_STATUS_STYLES, ReservationStatus } from '@features/reservations';
import { createEmptyClass } from '@features/classes/factories/class-factories';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassReservationPricing } from './class-reservation-pricing';

describe('ClassReservationPricing', () => {
  let component: ClassReservationPricing;
  let fixture: ComponentFixture<ClassReservationPricing>;
  let formService: ClassFormService;

  function query<T extends Element>(selector: string): T | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function totalPriceInput() {
    return query<HTMLInputElement>('#reservation-total-price')!;
  }

  function sumToggle() {
    return query<HTMLInputElement>('input[type="checkbox"]')!;
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationPricing],
      providers: [ClassFormService],
    }).compileComponents();

    formService = TestBed.inject(ClassFormService);
    formService.reservationModel.update((model) => ({
      ...model,
      classes: [
        { ...createEmptyClass(), price: 1300 },
        { ...createEmptyClass(), price: 1500 },
      ],
    }));

    fixture = TestBed.createComponent(ClassReservationPricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reservation status', () => {
    it('should render a button for every reservation status', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[aria-pressed]');
      const labels = Array.from(buttons as NodeListOf<HTMLButtonElement>).map((b) =>
        b.textContent?.trim(),
      );

      expect(labels).toEqual(
        Object.values(ReservationStatus).map((s) => RESERVATION_STATUS_STYLES[s].label),
      );
    });

    it('should mark the current status as pressed', () => {
      const pressed = query<HTMLButtonElement>('button[aria-pressed="true"]')!;

      expect(pressed.textContent?.trim()).toBe(
        RESERVATION_STATUS_STYLES[ReservationStatus.Confirmed].label,
      );
    });

    it('should update the form status when a status is clicked', () => {
      const status = Object.values(ReservationStatus).find(
        (s) => s !== ReservationStatus.Confirmed,
      )!;
      const button = Array.from(
        fixture.nativeElement.querySelectorAll('button[aria-pressed]') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === RESERVATION_STATUS_STYLES[status].label)!;

      button.click();
      fixture.detectChanges();

      expect(formService.reservationModel().reservationStatus).toBe(status);
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('total price', () => {
    it('should use the classes sum by default because total price starts as null', () => {
      expect(formService.reservationModel().totalPrice).toBeNull();
      expect(sumToggle().checked).toBe(true);
      expect(totalPriceInput().disabled).toBe(true);
      expect(totalPriceInput().value).toBe('2800');
      expect(text()).toContain('Računa se automatski iz cena časova.');
    });

    it('should follow class price changes while the sum is used', () => {
      formService.updateClass(0, { price: 2000 });
      fixture.detectChanges();

      expect(totalPriceInput().value).toBe('3500');
    });

    it('should switch to a manual price prefilled with the classes sum', () => {
      sumToggle().click();
      fixture.detectChanges();

      expect(formService.reservationModel().totalPrice).toBe(2800);
      expect(totalPriceInput().disabled).toBe(false);
      expect(text()).not.toContain('Računa se automatski');
    });

    it('should reset the price to null when the sum is turned back on', () => {
      sumToggle().click();
      fixture.detectChanges();
      sumToggle().click();
      fixture.detectChanges();

      expect(formService.reservationModel().totalPrice).toBeNull();
      expect(totalPriceInput().disabled).toBe(true);
    });

    it('should show a validation error for a negative price', () => {
      formService.reservationForm.totalPrice().value.set(-1);
      fixture.detectChanges();

      expect(text()).toContain('Ukupna cena rezervacije može biti najmanje 0 RSD.');
    });
  });

  describe('paid amount', () => {
    it('should hide the paid amount when totalPaid is not set', () => {
      expect(query('#reservation-paid-amount')).toBeNull();
      expect(query('.md\\:grid-cols-2')).not.toBeNull();
    });

    it('should show the paid amount as a read-only field when totalPaid is set', () => {
      fixture.componentRef.setInput('totalPaid', 1300);
      fixture.detectChanges();

      const paid = query<HTMLInputElement>('#reservation-paid-amount')!;
      expect(paid.value).toBe('1300');
      expect(paid.disabled).toBe(true);
      expect(query('.md\\:grid-cols-3')).not.toBeNull();
      expect(text()).toContain('Menja se isključivo kroz uplate.');
    });
  });
});
