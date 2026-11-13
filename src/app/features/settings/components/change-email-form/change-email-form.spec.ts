import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeEmailForm } from './change-email-form';

describe('ChangeEmailForm', () => {
  let component: ChangeEmailForm;
  let fixture: ComponentFixture<ChangeEmailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEmailForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeEmailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
