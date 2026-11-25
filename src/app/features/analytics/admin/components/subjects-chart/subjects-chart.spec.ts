import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsChart } from './subjects-chart';

describe('SubjectsChart', () => {
  let component: SubjectsChart;
  let fixture: ComponentFixture<SubjectsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsChart],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
