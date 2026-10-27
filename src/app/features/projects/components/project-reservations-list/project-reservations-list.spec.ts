import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReservationsList } from './project-reservations-list';

describe('ProjectReservationsList', () => {
  let component: ProjectReservationsList;
  let fixture: ComponentFixture<ProjectReservationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationsList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
