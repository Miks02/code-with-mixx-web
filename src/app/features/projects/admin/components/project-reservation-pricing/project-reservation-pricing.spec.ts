import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectReservationPricing } from './project-reservation-pricing';

describe('ProjectReservationPricing', () => {
  let component: ProjectReservationPricing;
  let fixture: ComponentFixture<ProjectReservationPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationPricing],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
