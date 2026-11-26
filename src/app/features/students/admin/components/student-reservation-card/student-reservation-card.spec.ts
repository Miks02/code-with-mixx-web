import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { priceConverter } from '@core/utilities/price-helpers';
import { PaymentStatus, ReservationStatus, ReservationType } from '@features/reservations';
import { ProjectType } from '@features/projects';
import { StudentReservation } from '@features/students/models/student-details';
import { StudentReservationCard } from './student-reservation-card';

const CLASS_RESERVATION: StudentReservation = {
  id: 7,
  reservationType: ReservationType.Class,
  reservationStatus: ReservationStatus.Confirmed,
  paymentStatus: PaymentStatus.PartiallyPaid,
  totalPrice: 3900,
  paidAmount: 1300,
  discountRate: 0,
  bonus: 0,
  description: null,
  reservedAt: '2026-10-18',
  createdAt: '2026-10-18T09:00:00Z',
  classes: [1, 2, 3].map((id) => ({
    id,
    name: `Čas ${id}`,
    subjectId: id === 3 ? 2 : 1,
    subjectName: id === 3 ? 'Baze podataka' : 'Objektno orijentisano programiranje',
    price: 1300,
    startsAt: '2026-11-03T10:00:00',
    endsAt: '2026-11-03T10:45:00',
    reservedAt: '2026-10-18',
  })),
  projects: [],
};

const PROJECT_RESERVATION: StudentReservation = {
  ...CLASS_RESERVATION,
  id: 12,
  reservationType: ReservationType.Project,
  reservationStatus: ReservationStatus.Cancelled,
  paymentStatus: PaymentStatus.Overdue,
  classes: [],
  projects: [
    {
      id: 1,
      subjectId: 1,
      subjectName: 'Veb programiranje',
      projectType: ProjectType.Graduation,
      price: 3900,
      progress: 40,
      githubLink: null,
      downloadLink: null,
      reservedAt: '2026-10-18',
      startDate: '2026-10-20',
      endDate: '2026-12-20',
      notesCount: 2,
    },
  ],
};

describe('StudentReservationCard', () => {
  let fixture: ComponentFixture<StudentReservationCard>;
  let component: StudentReservationCard;

  async function render(reservation: StudentReservation) {
    fixture.componentRef.setInput('reservation', reservation);
    await fixture.whenStable();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReservationCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentReservationCard);
    component = fixture.componentInstance;
  });

  describe('for a class reservation', () => {
    beforeEach(() => render(CLASS_RESERVATION));

    it('should link to the class reservation details', () => {
      const link = element().querySelector('a');
      expect(link?.getAttribute('href')).toBe('/admin/classes/update/7');
    });

    it('should show the type label and unique subject names', () => {
      expect(component.typeLabel()).toBe('Časovi');
      expect(component.subjects()).toBe('Objektno orijentisano programiranje, Baze podataka');
    });

    it('should show the class count, price and paid amount', () => {
      const text = element().textContent ?? '';
      expect(text).toContain('Časovi');
      expect(component.stats()[0].value).toBe(3);
      expect(text).toContain(priceConverter(3900));
      expect(text).toContain(priceConverter(1300));
    });

    it('should show the reservation and payment status badges', () => {
      const text = element().textContent ?? '';
      expect(text).toContain('Potvrđena');
      expect(text).toContain('Delimično plaćeno');
    });

    it('should not be dimmed by default', () => {
      expect(element().querySelector('a')?.style.opacity).toBe('');
    });
  });

  describe('for a project reservation', () => {
    beforeEach(() => render(PROJECT_RESERVATION));

    it('should link to the project reservation details', () => {
      const link = element().querySelector('a');
      expect(link?.getAttribute('href')).toBe('/admin/projects/details/12');
    });

    it('should list subjects with their project type', () => {
      expect(component.typeLabel()).toBe('Projekti');
      expect(component.subjects()).toBe('Veb programiranje (Diplomski)');
    });

    it('should count projects', () => {
      expect(component.stats()[0]).toEqual(
        expect.objectContaining({ label: 'Projekti', value: 1 }),
      );
    });

    it('should use the cancelled background and statuses', () => {
      expect(component.containerClasses()).toContain('bg-red-700/30');
      const text = element().textContent ?? '';
      expect(text).toContain('Otkazana');
      expect(text).toContain('Kasni uplata');
    });
  });

  it('should dim the card while fetching', async () => {
    fixture.componentRef.setInput('addOpacity', true);
    await render(CLASS_RESERVATION);
    expect(element().querySelector('a')?.style.opacity).toBe('0.5');
  });
});
