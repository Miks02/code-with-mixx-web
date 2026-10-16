import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectReservationDetailsPage } from './project-reservation-details-page';

describe('ProjectReservationDetailsPage', () => {
  let component: ProjectReservationDetailsPage;
  let fixture: ComponentFixture<ProjectReservationDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
