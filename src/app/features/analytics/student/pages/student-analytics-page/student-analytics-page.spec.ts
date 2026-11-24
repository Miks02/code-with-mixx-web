import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentAnalyticsPage } from './student-analytics-page';

describe('StudentAnalyticsPage', () => {
  let component: StudentAnalyticsPage;
  let fixture: ComponentFixture<StudentAnalyticsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAnalyticsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentAnalyticsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
