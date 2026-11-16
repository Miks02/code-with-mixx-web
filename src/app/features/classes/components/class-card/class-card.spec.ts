import { ComponentFixture, TestBed } from '@angular/core/testing';
import { timeConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { createClassItem } from '@features/classes/testing/class-test-utils';
import { ClassCard } from './class-card';

describe('ClassCard', () => {
  it('shows the subject, price and the local time range of the class', async () => {
    await TestBed.configureTestingModule({ imports: [ClassCard] }).compileComponents();
    const fixture: ComponentFixture<ClassCard> = TestBed.createComponent(ClassCard);
    const item = createClassItem({
      subjectName: 'Web programiranje',
      price: 1500,
      startsAt: '2026-10-05T10:00:00Z',
      endsAt: '2026-10-05T10:45:00Z',
    });
    fixture.componentRef.setInput('class', item);
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Web programiranje');
    expect(text).toContain(priceConverter(1500));
    expect(text).toContain(`${timeConverter(item.startsAt)} - ${timeConverter(item.endsAt)}`);
  });
});
