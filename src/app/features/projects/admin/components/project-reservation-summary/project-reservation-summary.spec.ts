import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectReservationSummary } from './project-reservation-summary';

describe('ProjectReservationSummary', () => {
  let component: ProjectReservationSummary;
  let fixture: ComponentFixture<ProjectReservationSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
