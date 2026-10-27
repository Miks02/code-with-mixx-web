import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectReservationListForm } from './project-reservation-list-form';

describe('ProjectReservationListForm', () => {
  let component: ProjectReservationListForm;
  let fixture: ComponentFixture<ProjectReservationListForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReservationListForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReservationListForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
