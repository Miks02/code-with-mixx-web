import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TermsSections } from './terms-sections';

describe('TermsSections', () => {
  let component: TermsSections;
  let fixture: ComponentFixture<TermsSections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsSections],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsSections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
