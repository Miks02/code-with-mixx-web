import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle, typeInto } from '@core/testing/test-utils';
import { ReservationStatus } from '@features/reservations';
import { ClassFormService } from '@features/classes/services/class-form-service';
import {
  createClassReservationDetails,
  createFormClass,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  inDays,
  provideReservationFormTesting,
} from '@features/classes/testing/class-test-utils';
import { ClassReservationPricing } from './class-reservation-pricing';

describe('ClassReservationPricing', () => {
  let fixture: ComponentFixture<ClassReservationPricing>;
  let element: HTMLElement;
  let form: ClassFormService;
  let http: HttpTestingController;

  const sumToggle = () => element.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  const totalInput = () => element.querySelector<HTMLInputElement>('#reservation-total-price')!;
  const paidInput = () => element.querySelector<HTMLInputElement>('#reservation-paid-amount');
  const totalError = () => element.querySelector('p.text-red-400')?.textContent?.trim();
  const toggleSum = async (checked: boolean) => {
    sumToggle().checked = checked;
    sumToggle().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const setup = async (reservationId: string | null) => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationPricing],
      providers: [provideReservationFormTesting(reservationId), provideHttpTesting()],
    }).compileComponents();

    form = TestBed.inject(ClassFormService);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ClassReservationPricing);
    element = fixture.nativeElement;
    await flushLookups();
  };

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice: null,
          classes: [
            createFormClass(inDays(3, 10), { price: 1300 }),
            createFormClass(inDays(3, 11), { price: 1500 }),
          ],
        }),
      );
      await fixture.whenStable();
    });

    it('does not show the paid amount', () => {
      expect(paidInput()).toBeNull();
    });

    it('starts with "Zbir časova" on, showing the sum and leaving the price to the backend', () => {
      expect(sumToggle().checked).toBe(true);
      expect(totalInput().disabled).toBe(true);
      expect(totalInput().value).toBe('2800');
      expect(form.reservationModel().totalPrice).toBeNull();
    });

    it('the shown sum follows the class prices', async () => {
      form.updateClass(1, { price: 500 });
      await fixture.whenStable();

      expect(totalInput().value).toBe('1800');
      expect(form.reservationModel().totalPrice).toBeNull();
    });

    it('turning the sum off prefills the price with the sum and stops following the classes', async () => {
      await toggleSum(false);

      expect(form.reservationModel().totalPrice).toBe(2800);
      expect(totalInput().disabled).toBe(false);

      form.updateClass(0, { price: 9000 });
      await fixture.whenStable();
      expect(form.reservationModel().totalPrice).toBe(2800);
    });

    it('turning the sum back on drops the manual price', async () => {
      await toggleSum(false);
      typeInto(totalInput(), '2000');
      await fixture.whenStable();
      expect(form.reservationModel().totalPrice).toBe(2000);

      await toggleSum(true);
      expect(form.reservationModel().totalPrice).toBeNull();
    });

    it('clearing the manual price keeps the field editable instead of switching to the sum', async () => {
      await toggleSum(false);

      typeInto(totalInput(), '');
      await fixture.whenStable();

      expect(sumToggle().checked).toBe(false);
      expect(totalInput().disabled).toBe(false);
    });

    it('rejects a negative manual price', async () => {
      await toggleSum(false);
      typeInto(totalInput(), '-100');
      await fixture.whenStable();

      expect(totalError()).toBe('Ukupna cena rezervacije može biti najmanje 0 RSD.');
    });

    it('allows a free reservation', async () => {
      await toggleSum(false);
      typeInto(totalInput(), '0');
      await fixture.whenStable();

      expect(form.reservationModel().totalPrice).toBe(0);
      expect(totalError()).toBeUndefined();
    });

    it('picking a status writes it into the form', async () => {
      const cancelled = Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.includes('Otkazana'),
      )!;

      cancelled.click();
      await fixture.whenStable();

      expect(form.reservationModel().reservationStatus).toBe(ReservationStatus.Cancelled);
      expect(cancelled.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('on the details page', () => {
    beforeEach(() => setup('7'));

    it('shows the paid amount as read only', async () => {
      expectReservationDetailsRequest().flush(createClassReservationDetails({ paidAmount: 1300 }));
      await settle();
      await fixture.whenStable();

      expect(paidInput()?.value).toBe('1300');
      expect(paidInput()?.disabled).toBe(true);
    });

    it('a saved reservation has its own price, so "Zbir časova" starts off', async () => {
      expectReservationDetailsRequest().flush(createClassReservationDetails({ totalPrice: 2000 }));
      await settle();
      await fixture.whenStable();

      expect(sumToggle().checked).toBe(false);
      expect(totalInput().value).toBe('2000');
    });
  });
});
