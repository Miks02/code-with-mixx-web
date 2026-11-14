import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SubjectList } from './subject-list';

describe('SubjectList', () => {
  let component: SubjectList;
  let fixture: ComponentFixture<SubjectList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
