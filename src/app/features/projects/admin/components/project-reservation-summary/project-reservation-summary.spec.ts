import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { priceConverter } from '@core/utilities/price-helpers';
import { createEmptyProject } from '@features/projects/factories/project-factories';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import {
  createProjectReservationDetails,
  createValidReservationModel,
  expectReservationDetailsRequest,
  flushLookups,
  flushReservationDetailsRefetch,
  PROJECT_RESERVATIONS_URL,
  provideReservationFormTesting,
} from '@features/projects/testing/project-test-utils';
import { ProjectReservationSummary } from './project-reservation-summary';

describe('ProjectReservationSummary', () => {
  let fixture: ComponentFixture<ProjectReservationSummary>;
  let element: HTMLElement;
  let form: ProjectFormService;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  const stats = () =>
    Object.fromEntries(
      Array.from(element.querySelectorAll('.grid > div')).map((stat) => [
        stat.querySelector('p.text-sm')?.textContent?.trim(),
        stat.querySelector('p.text-lg')?.textContent?.trim(),
      ]),
    );
  const paymentBadge = () => element.querySelector('span.rounded-full')?.textContent?.trim();
  const checks = () =>
    Array.from(element.querySelectorAll('li')).map((check) => check.textContent?.trim());
  const saveButton = () => getButton(element, 'Sačuvaj')!;
  const save = async () => {
    saveButton().click();
    await settle();
  };

  const setup = async (reservationId: string | null) => {
    toast = createToastServiceMock();
    await TestBed.configureTestingModule({
      imports: [ProjectReservationSummary],
      providers: [
        provideReservationFormTesting(reservationId),
        provideHttpTesting({ toastService: toast }),
      ],
    }).compileComponents();

    form = TestBed.inject(ProjectFormService);
    http = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProjectReservationSummary);
    element = fixture.nativeElement;
    await flushLookups();
  };

  const loadDetails = async (overrides = {}) => {
    expectReservationDetailsRequest().flush(createProjectReservationDetails(overrides));
    await settle();
    await fixture.whenStable();
  };

  afterEach(() => {
    flushReservationDetailsRefetch();
    http.verify();
  });

  describe('prices on the create page', () => {
    beforeEach(() => setup(null));

    const fill = async (totalPrice: number, prices: number[]) => {
      form.reservationModel.set(
        createValidReservationModel({
          totalPrice,
          projects: prices.map((price) => ({ ...createEmptyProject(), subjectId: 1, price })),
        }),
      );
      await fixture.whenStable();
    };

    it('shows the discount as the share of the projects sum that was taken off', async () => {
      await fill(9000, [6000, 6000]);

      expect(stats()).toEqual({
        'Ukupna cena': priceConverter(9000),
        Preostalo: priceConverter(9000),
        Popust: '25%',
      });
    });

    it('rounds the discount to two decimals', async () => {
      await fill(2000, [3000]);
      expect(stats()['Popust']).toBe('33.33%');
    });

    it('shows no discount when the total is higher than the projects sum', async () => {
      await fill(8000, [6000]);
      expect(stats()['Popust']).toBeUndefined();
    });

    it('shows a free reservation instead of a price of zero', async () => {
      await fill(0, [3000]);

      expect(stats()['Ukupna cena']).toBe('Besplatno');
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Čeka uplatu');
    });
  });

  describe('payments on the details page', () => {
    beforeEach(() => setup('7'));

    it('a partly paid reservation shows what was paid and what remains', async () => {
      await loadDetails({ totalPrice: 9000, paidAmount: 3000 });

      expect(stats()['Plaćeno']).toBe(priceConverter(3000));
      expect(stats()['Preostalo']).toBe(priceConverter(6000));
      expect(paymentBadge()).toBe('Delimično plaćeno');
    });

    it('paying more than the price shows the extra as a bonus and nothing remaining', async () => {
      await loadDetails({ totalPrice: 9000, paidAmount: 10000 });

      expect(stats()['Bonus']).toBe(priceConverter(1000));
      expect(stats()['Preostalo']).toBeUndefined();
      expect(paymentBadge()).toBe('Plaćeno');
    });

    it('lowering the price below what was paid turns the difference into a bonus', async () => {
      await loadDetails({ totalPrice: 9000, paidAmount: 9000 });

      form.reservationForm.totalPrice().value.set(8000);
      await fixture.whenStable();

      expect(stats()['Bonus']).toBe(priceConverter(1000));
    });
  });

  describe('checks', () => {
    beforeEach(() => setup(null));

    it('a fresh form is missing the student and the subject, so it cannot be saved', async () => {
      await fixture.whenStable();

      expect(checks()).toContain('Student nije izabran');
      expect(checks()).toContain('Svi projekti moraju imati izabrani predmet.');
      expect(saveButton().disabled).toBe(true);
    });

    it('a complete form passes every check and can be saved', async () => {
      form.reservationModel.set(createValidReservationModel());
      await fixture.whenStable();

      expect(checks()).toEqual([
        'Student je izabran',
        'Rezervacija ima bar jedan projekat',
        'Polja svih projekata su ispravna',
        'Svi projekti imaju izabrani predmet.',
      ]);
      expect(saveButton().disabled).toBe(false);
    });

    it('a project ending before it starts fails the project fields check', async () => {
      form.reservationModel.set(
        createValidReservationModel({
          projects: [
            {
              ...createEmptyProject(),
              subjectId: 1,
              startDate: '2026-10-20',
              endDate: '2026-10-10',
              reservedAt: '2026-10-01',
            },
          ],
          reservedAt: '2026-10-01',
        }),
      );
      await fixture.whenStable();

      expect(checks()).toContain('Neka polja projekata nisu ispravna');
      expect(saveButton().disabled).toBe(true);
    });
  });

  describe('saving on the create page', () => {
    beforeEach(async () => {
      await setup(null);
      form.reservationModel.set(createValidReservationModel({ description: '' }));
      await fixture.whenStable();
    });

    it('creates the reservation, sends empty optional fields as null and goes back to the list', async () => {
      await save();

      const request = http.expectOne(
        (req) => req.url === PROJECT_RESERVATIONS_URL && req.method === 'POST',
      );
      expect(request.request.body).toEqual(
        expect.objectContaining({
          id: 0,
          studentId: 'student-1',
          totalPrice: 6000,
          description: null,
        }),
      );
      expect(request.request.body.projects[0]).toEqual(
        expect.objectContaining({ subjectId: 1, githubLink: null, downloadLink: null }),
      );
      request.flush(null);
      await settle();

      expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno kreirana.');
      expect(navigateByUrl).toHaveBeenCalledWith('/admin/projects');
    });

    it('cannot be saved twice while the request is running', async () => {
      await save();
      fixture.detectChanges();

      expect(saveButton().disabled).toBe(true);

      http.expectOne((req) => req.method === 'POST').flush(null);
      await settle();
    });

    it('stays on the page and shows the domain error when saving fails', async () => {
      await save();

      http
        .expectOne((req) => req.method === 'POST')
        .flush(createProblemDetails('Student.NotFound'), { status: 404, statusText: 'Not Found' });
      await settle();

      expect(toast.showError).toHaveBeenCalledWith(
        'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.',
      );
      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  it('updates the loaded reservation on the details page', async () => {
    await setup('7');
    await loadDetails();

    await save();

    const request = http.expectOne(
      (req) => req.url === `${PROJECT_RESERVATIONS_URL}/7` && req.method === 'PUT',
    );
    expect(request.request.body).toEqual(
      expect.objectContaining({ id: 7, studentId: 'student-2', projectsToDelete: [] }),
    );
    expect(request.request.body.projects.map((project: { id: number }) => project.id)).toEqual([
      21,
    ]);
    request.flush(null);
    await settle();

    expect(toast.showSuccess).toHaveBeenCalledWith('Rezervacija je uspešno ažurirana.');
    expect(navigateByUrl).toHaveBeenCalledWith('/admin/projects');
  });

  it('"Poništi formu" clears what was entered', async () => {
    await setup(null);
    form.reservationModel.set(createValidReservationModel());
    await fixture.whenStable();

    getButton(element, 'Poništi formu')!.click();
    await fixture.whenStable();

    expect(form.reservationModel().studentId).toBe('');
    expect(form.reservationModel().projects[0].subjectId).toBe(0);
  });
});
