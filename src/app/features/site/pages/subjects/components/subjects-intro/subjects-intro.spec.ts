import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsIntro } from './subjects-intro';

describe('SubjectsIntro', () => {
  let component: SubjectsIntro;
  let fixture: ComponentFixture<SubjectsIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsIntro],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsIntro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
