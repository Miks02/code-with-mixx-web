import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReservationCard } from './project-reservation-card';

describe('ProjectReservationCard', () => {
  let component: ProjectReservationCard;
  let fixture: ComponentFixture<ProjectReservationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
