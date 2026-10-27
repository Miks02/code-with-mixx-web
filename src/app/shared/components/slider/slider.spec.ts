import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Slider } from './slider';

describe('Slider', () => {
  let component: Slider;
  let fixture: ComponentFixture<Slider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Slider],
    }).compileComponents();

    fixture = TestBed.createComponent(Slider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the header when there is no label and the value is hidden', async () => {
    fixture.componentRef.setInput('showValue', false);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('label')).toBeNull();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();
  });

  it('should render the label and the value with its unit', async () => {
    fixture.componentRef.setInput('label', 'Napredak');
    fixture.componentRef.setInput('value', 50);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('label').textContent).toContain('Napredak');
    expect(fixture.nativeElement.querySelector('span').textContent).toContain('50%');
  });

  it('should update the value when the range input changes', async () => {
    const range: HTMLInputElement = fixture.nativeElement.querySelector('input');
    range.value = '75';
    range.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(component.value()).toBe(75);
    expect(component.fillRatio()).toBe(0.75);
  });
});
