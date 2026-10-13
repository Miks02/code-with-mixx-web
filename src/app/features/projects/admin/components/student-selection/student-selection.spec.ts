import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentSelection } from './student-selection';

describe('StudentSelection', () => {
  let component: StudentSelection;
  let fixture: ComponentFixture<StudentSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
