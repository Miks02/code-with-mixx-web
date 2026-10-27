import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReservationDetails } from './project-reservation-details';

describe('ProjectReservationDetails', () => {
  let component: ProjectReservationDetails;
  let fixture: ComponentFixture<ProjectReservationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
