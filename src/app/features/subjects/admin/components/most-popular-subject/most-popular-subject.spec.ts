import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostPopularSubject } from './most-popular-subject';

describe('MostPopularSubject', () => {
  let component: MostPopularSubject;
  let fixture: ComponentFixture<MostPopularSubject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostPopularSubject],
    }).compileComponents();

    fixture = TestBed.createComponent(MostPopularSubject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
