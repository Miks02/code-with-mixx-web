import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStudentForm } from './create-student-form';

describe('CreateStudentForm', () => {
  let component: CreateStudentForm;
  let fixture: ComponentFixture<CreateStudentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateStudentForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateStudentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
