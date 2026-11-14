import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';
import { InquiryDetails } from './inquiry-details';

const inquiry: InquiryItem = {
  id: 3,
  firstName: 'Ana',
  lastName: 'Anić',
  email: 'ana@example.com',
  phoneNumber: '+381601234567',
  message: 'Zanimaju me časovi programiranja.',
  inquiryType: InquiryType.ClassPackage,
  isResolved: false,
  resolvedAt: null,
  resolvedByAdminId: null,
  resolvedByAdminName: null,
  createdAt: '2026-11-01T10:00:00Z',
};

describe('InquiryDetails', () => {
  let component: InquiryDetails;
  let fixture: ComponentFixture<InquiryDetails>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  const setInquiry = (value: InquiryItem) => {
    fixture.componentRef.setInput('inquiry', value);
    fixture.detectChanges();
  };

  const findButton = (label: string) =>
    Array.from(element.querySelectorAll('app-button')).find((button) =>
      button.textContent?.includes(label),
    );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the placeholder when no inquiry is selected', () => {
    expect(element.textContent).toContain('Izaberi upit iz liste da vidiš detalje');
  });

  it('should render contact links, type and message', () => {
    setInquiry(inquiry);

    expect(element.querySelector('a[href="mailto:ana@example.com"]')).toBeTruthy();
    expect(element.querySelector('a[href="tel:+381601234567"]')).toBeTruthy();
    expect(element.textContent).toContain('Paket časova');
    expect(element.textContent).toContain(inquiry.message);
  });

  it('should offer resolve and delete for an unresolved inquiry', () => {
    setInquiry(inquiry);

    expect(findButton('Označi kao rešen')).toBeTruthy();
    expect(findButton('Obriši upit')).toBeTruthy();
  });

  it('should hide resolve and show who resolved a resolved inquiry', () => {
    setInquiry({
      ...inquiry,
      isResolved: true,
      resolvedAt: '2026-11-02T10:00:00Z',
      resolvedByAdminId: 'admin-1',
      resolvedByAdminName: 'Milan Admin',
    });

    expect(findButton('Označi kao rešen')).toBeUndefined();
    expect(element.textContent).toContain('Milan Admin');
  });

  it('should emit the inquiry id on resolve and delete', () => {
    const resolved: number[] = [];
    const deleted: number[] = [];
    component.resolveInquiry.subscribe((id) => resolved.push(id));
    component.deleteInquiry.subscribe((id) => deleted.push(id));
    setInquiry(inquiry);

    findButton('Označi kao rešen')!.querySelector('button')!.click();
    findButton('Obriši upit')!.querySelector('button')!.click();

    expect(resolved).toEqual([3]);
    expect(deleted).toEqual([3]);
  });
});
