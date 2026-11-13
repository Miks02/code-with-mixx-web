import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTokenModal } from './email-token-modal';

describe('EmailTokenModal', () => {
  let component: EmailTokenModal;
  let fixture: ComponentFixture<EmailTokenModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTokenModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTokenModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
