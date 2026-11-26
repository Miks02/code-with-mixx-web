import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsCard } from './stats-card';

describe('StatsCard', () => {
  let fixture: ComponentFixture<StatsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCard);
    fixture.componentRef.setInput('title', 'Predmeti');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('icon', 'faSolidBook');
    fixture.componentRef.setInput('iconBackground', 'sky');
    await fixture.whenStable();
  });

  it('should render skeleton placeholders when isPending is true', () => {
    fixture.componentRef.setInput('isPending', true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
