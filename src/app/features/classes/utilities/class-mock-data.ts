import { PaymentStatus, ReservationStatus } from '@features/reservations';
import { ClassReservationDetails } from '../models/class-reservation-details';

// TODO: remove once ClassService exposes the class reservation details query
export const MOCK_CLASS_RESERVATION_DETAILS: ClassReservationDetails = {
  id: 1,
  studentId: '',
  studentFullName: 'Marko Marković',
  studentEmail: 'marko.markovic@example.com',
  studentUniversity: 'Elektrotehnički fakultet',
  reservationStatus: ReservationStatus.Confirmed,
  paymentStatus: PaymentStatus.PartiallyPaid,
  totalPrice: 3900,
  paidAmount: 1300,
  discountRate: 0,
  bonus: 0,
  description: 'Priprema za kolokvijum iz OOP-a.',
  createdAt: '2026-10-20T09:00:00Z',
  updatedAt: null,
  classes: [
    {
      id: 1,
      subjectId: 1,
      subjectName: 'Objektno orijentisano programiranje',
      price: 1300,
      startsAt: '2026-11-03T10:00:00',
      endsAt: '2026-11-03T10:45:00',
      reservedAt: '2026-10-20',
    },
    {
      id: 2,
      subjectId: 1,
      subjectName: 'Objektno orijentisano programiranje',
      price: 1300,
      startsAt: '2026-11-03T10:50:00',
      endsAt: '2026-11-03T11:35:00',
      reservedAt: '2026-10-20',
    },
    {
      id: 3,
      subjectId: 1,
      subjectName: 'Objektno orijentisano programiranje',
      price: 1300,
      startsAt: '2026-11-03T11:40:00',
      endsAt: '2026-11-03T12:25:00',
      reservedAt: '2026-10-20',
    },
  ],
};
