import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationPaymentHistoryModal } from './reservation-payment-history-modal';

describe('ReservationPaymentHistoryModal', () => {
  let component: ReservationPaymentHistoryModal;
  let fixture: ComponentFixture<ReservationPaymentHistoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationPaymentHistoryModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationPaymentHistoryModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
