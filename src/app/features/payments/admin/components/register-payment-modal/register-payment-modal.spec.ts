import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPaymentModal } from './register-payment-modal';

describe('RegisterPaymentModal', () => {
  let component: RegisterPaymentModal;
  let fixture: ComponentFixture<RegisterPaymentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPaymentModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPaymentModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
