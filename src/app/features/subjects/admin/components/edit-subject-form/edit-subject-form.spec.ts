import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSubjectForm } from './edit-subject-form';

describe('EditSubjectForm', () => {
  let component: EditSubjectForm;
  let fixture: ComponentFixture<EditSubjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSubjectForm],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSubjectForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
