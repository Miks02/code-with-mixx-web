import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectReservationPage } from './create-project-reservation-page';

describe('CreateProjectReservationPage', () => {
  let component: CreateProjectReservationPage;
  let fixture: ComponentFixture<CreateProjectReservationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectReservationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectReservationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
