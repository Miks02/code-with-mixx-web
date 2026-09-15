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
    fixture.componentRef.setInput('subject', undefined);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton placeholders when isPending is true', () => {
    fixture.componentRef.setInput('isPending', true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
