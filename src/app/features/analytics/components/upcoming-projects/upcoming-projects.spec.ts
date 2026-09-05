import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingProjects } from './upcoming-projects';

describe('UpcomingProjects', () => {
  let component: UpcomingProjects;
  let fixture: ComponentFixture<UpcomingProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingProjects],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingProjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
