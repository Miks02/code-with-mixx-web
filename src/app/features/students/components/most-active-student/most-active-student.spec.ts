import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostActiveStudent } from './most-active-student';

describe('MostActiveStudent', () => {
  let component: MostActiveStudent;
  let fixture: ComponentFixture<MostActiveStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostActiveStudent],
    }).compileComponents();

    fixture = TestBed.createComponent(MostActiveStudent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('student', undefined);
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
