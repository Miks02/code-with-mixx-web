import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassReservationCard } from './class-reservation-card';
import { PaymentStatus, ReservationStatus } from '@features/reservations';

describe('ClassReservationCard', () => {
  let component: ClassReservationCard;
  let fixture: ComponentFixture<ClassReservationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reservation', {
      id: 1,
      studentId: 'student-1',
      studentFullName: 'Marko Marković',
      reservationStatus: ReservationStatus.Confirmed,
      paymentStatus: PaymentStatus.Pending,
      totalPrice: 0,
      paidAmount: 0,
      discountRate: 0,
      bonus: 0,
      createdAt: '2026-10-01T10:00:00Z',
      startsAt: '2026-10-02T10:00:00Z',
      endsAt: '2026-10-02T11:00:00Z',
      classes: [],
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
