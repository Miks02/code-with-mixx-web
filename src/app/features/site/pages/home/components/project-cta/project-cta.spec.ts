import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectCta } from './project-cta';

describe('ProjectCta', () => {
  let component: ProjectCta;
  let fixture: ComponentFixture<ProjectCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
