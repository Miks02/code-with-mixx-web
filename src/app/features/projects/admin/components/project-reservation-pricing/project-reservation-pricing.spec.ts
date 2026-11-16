import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { ReservationStatus } from '@features/reservations';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import {
  createProjectReservationDetails,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  provideReservationFormTesting,
} from '@features/projects/testing/project-test-utils';
import { createEmptyProject } from '@features/projects/factories/project-factories';
import { ProjectReservationPricing } from './project-reservation-pricing';

describe('ProjectReservationPricing', () => {
  let fixture: ComponentFixture<ProjectReservationPricing>;
  let element: HTMLElement;
  let form: ProjectFormService;
  let http: HttpTestingController;

  const sumToggle = () => element.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  const totalInput = () => element.querySelector<HTMLInputElement>('#reservation-total-price')!;
  const paidInput = () => element.querySelector<HTMLInputElement>('#reservation-paid-amount');
  const toggleSum = async (checked: boolean) => {
    sumToggle().checked = checked;
    sumToggle().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const setup = async (reservationId: string | null) => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationPricing],
      providers: [provideReservationFormTesting(reservationId), provideHttpTesting()],
    }).compileComponents();

    form = TestBed.inject(ProjectFormService);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProjectReservationPricing);
    element = fixture.nativeElement;
    await flushLookups();
  };

  afterEach(() => http.verify());

  describe('on the create page', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice: 5000,
          projects: [
            { ...createEmptyProject(), subjectId: 1, price: 3000 },
            { ...createEmptyProject(), subjectId: 2, price: 4500 },
          ],
        }),
      );
      await fixture.whenStable();
    });

    it('does not show the paid amount', () => {
      expect(paidInput()).toBeNull();
    });

    it('"Zbir projekata" sets the total price to the sum and keeps following the prices', async () => {
      await toggleSum(true);
      expect(form.reservationModel().totalPrice).toBe(7500);
      expect(totalInput().disabled).toBe(true);

      form.updateProject(1, { price: 500 });
      await fixture.whenStable();
      expect(form.reservationModel().totalPrice).toBe(3500);
    });

    it('turning the sum off keeps the last sum and lets the price be edited again', async () => {
      await toggleSum(true);
      await toggleSum(false);

      expect(form.reservationModel().totalPrice).toBe(7500);
      expect(totalInput().disabled).toBe(false);

      form.updateProject(0, { price: 9000 });
      await fixture.whenStable();
      expect(form.reservationModel().totalPrice).toBe(7500);
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

  it('shows the paid amount on the details page', async () => {
    await setup('7');
    expectReservationDetailsRequest().flush(createProjectReservationDetails({ paidAmount: 3000 }));
    await settle();
    await fixture.whenStable();

    expect(paidInput()?.value).toBe('3000');
    expect(paidInput()?.disabled).toBe(true);
  });
});
