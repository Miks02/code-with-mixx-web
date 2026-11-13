import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneNumberForm } from './phone-number-form';

describe('PhoneNumberForm', () => {
  let component: PhoneNumberForm;
  let fixture: ComponentFixture<PhoneNumberForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneNumberForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneNumberForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
