import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';
import { InquiryCard } from './inquiry-card';

const inquiry: InquiryItem = {
  id: 7,
  firstName: 'Ana',
  lastName: 'Anić',
  email: 'ana@example.com',
  phoneNumber: '+381601234567',
  message: 'Zanimaju me časovi programiranja.',
  inquiryType: InquiryType.Project,
  isResolved: false,
  resolvedAt: null,
  resolvedByAdminId: null,
  resolvedByAdminName: null,
  createdAt: '2026-11-01T10:00:00Z',
};

describe('InquiryCard', () => {
  let component: InquiryCard;
  let fixture: ComponentFixture<InquiryCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inquiry', inquiry);
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render name, initials, type and status', () => {
    expect(component.fullName()).toBe('Ana Anić');
    expect(component.initials()).toBe('AA');
    expect(element.textContent).toContain('Seminarski / diplomski rad');
    expect(element.textContent).toContain('Nerešen');
  });

  it('should show the resolved status for a resolved inquiry', () => {
    fixture.componentRef.setInput('inquiry', { ...inquiry, isResolved: true });
    fixture.detectChanges();

    expect(element.textContent).toContain('Rešen');
    expect(element.textContent).not.toContain('Nerešen');
  });

  it('should emit the inquiry when clicked and undefined when already selected', () => {
    const emitted: (InquiryItem | undefined)[] = [];
    component.selected.subscribe((value) => emitted.push(value));
    const card = element.querySelector<HTMLElement>('[role="button"]')!;

    card.click();
    fixture.componentRef.setInput('isSelected', true);
    fixture.detectChanges();
    card.click();

    expect(emitted).toEqual([inquiry, undefined]);
  });

  it('should emit the id on checkbox click without selecting the card', () => {
    const selected: (InquiryItem | undefined)[] = [];
    const checked: number[] = [];
    component.selected.subscribe((value) => selected.push(value));
    component.checkedToggled.subscribe((value) => checked.push(value));

    element.querySelector<HTMLButtonElement>('[role="checkbox"]')!.click();

    expect(checked).toEqual([7]);
    expect(selected).toEqual([]);
  });

  it('should reflect the checked state on the checkbox', () => {
    const checkbox = element.querySelector<HTMLButtonElement>('[role="checkbox"]')!;
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    fixture.componentRef.setInput('isChecked', true);
    fixture.detectChanges();

    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });
});
