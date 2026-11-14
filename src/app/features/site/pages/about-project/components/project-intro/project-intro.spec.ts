import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectIntro } from './project-intro';

describe('ProjectIntro', () => {
  let component: ProjectIntro;
  let fixture: ComponentFixture<ProjectIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectIntro],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectIntro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
