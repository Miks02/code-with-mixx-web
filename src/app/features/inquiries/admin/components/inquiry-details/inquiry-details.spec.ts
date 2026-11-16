import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogResult } from '@core/components/dialog/dialog';
import {
  createDialogServiceMock,
  createProblemDetails,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
} from '@core/testing/test-utils';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import { InquiryType } from '@features/inquiries/models/inquiry-type';
import {
  createInquiriesSummary,
  createInquiry,
  createPagedInquiries,
  flushInquiriesSummary,
  INQUIRIES_URL,
} from '@features/inquiries/testing/inquiry-test-utils';
import { InquiryDetails } from './inquiry-details';

describe('InquiryDetails', () => {
  let fixture: ComponentFixture<InquiryDetails>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminInquiryStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: ReturnType<typeof createDialogServiceMock>;

  const inquiry = createInquiry({ id: 3, inquiryType: InquiryType.ClassPackage });

  const load = async (items: InquiryItem[] = [inquiry]) => {
    await flushInquiriesSummary(
      createInquiriesSummary({ pagedInquiries: createPagedInquiries(items) }),
    );
    await fixture.whenStable();
  };

  beforeEach(async () => {
    toast = createToastServiceMock();
    dialog = createDialogServiceMock();

    await TestBed.configureTestingModule({
      imports: [InquiryDetails],
      providers: [
        AdminInquiryStore,
        provideHttpTesting({ toastService: toast, dialogService: dialog }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryDetails);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminInquiryStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushInquiriesSummary();
    http.verify();
  });

  it('shows the placeholder when no inquiry is selected', async () => {
    await load([]);
    expect(element.textContent).toContain('Izaberi upit iz liste da vidiš detalje');
  });

  it('shows the inquiry selected in the store', async () => {
    await load([inquiry, createInquiry({ id: 4, firstName: 'Marko' })]);
    expect(element.querySelector('h2')?.textContent).toContain('Ana Anić');

    store.selectInquiry(store.pagedItems()![1]);
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toContain('Marko');
  });

  it('renders contact links, type, status and message', async () => {
    await load();

    expect(element.querySelector('a[href="mailto:ana@example.com"]')).toBeTruthy();
    expect(element.querySelector('a[href="tel:+381601234567"]')).toBeTruthy();
    expect(element.textContent).toContain('Paket časova');
    expect(element.textContent).toContain('Nerešen');
    expect(element.textContent).toContain(inquiry.message);
  });

  it('hides resolve and shows who resolved a resolved inquiry', async () => {
    await load([
      createInquiry({
        id: 3,
        isResolved: true,
        resolvedAt: '2026-11-02T10:00:00Z',
        resolvedByAdminId: 'admin-1',
        resolvedByAdminName: 'Milan Admin',
      }),
    ]);

    expect(getButton(element, 'Označi kao rešen')).toBeUndefined();
    expect(element.textContent).toContain('Rešen');
    expect(element.textContent).toContain('Milan Admin');
  });

  it('resolves the inquiry and shows a success toast', async () => {
    await load();

    getButton(element, 'Označi kao rešen')!.click();
    await settle();

    const request = http.expectOne(`${INQUIRIES_URL}/3/resolve`);
    expect(request.request.method).toBe('POST');
    request.flush({ ...inquiry, isResolved: true });
    await flushInquiriesSummary(
      createInquiriesSummary({
        pagedInquiries: createPagedInquiries([{ ...inquiry, isResolved: true }]),
      }),
    );
    await fixture.whenStable();

    expect(toast.showSuccess).toHaveBeenCalledWith('Upit je označen kao rešen.');
    expect(getButton(element, 'Označi kao rešen')).toBeUndefined();
  });

  it('shows the domain error message when resolving fails', async () => {
    await load();

    getButton(element, 'Označi kao rešen')!.click();
    await settle();

    http
      .expectOne(`${INQUIRIES_URL}/3/resolve`)
      .flush(createProblemDetails('Inquiry.AlreadyResolved'), {
        status: 409,
        statusText: 'Conflict',
      });
    await settle();

    expect(toast.showError).toHaveBeenCalledWith('Upit je već označen kao rešen.');
  });

  it('deletes the inquiry after confirmation', async () => {
    dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
    await load();

    getButton(element, 'Obriši upit')!.click();
    await settle();

    expect(dialog.showDialog).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Ana Anić') }),
    );
    const request = http.expectOne(`${INQUIRIES_URL}/3`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    await flushInquiriesSummary(
      createInquiriesSummary({ pagedInquiries: createPagedInquiries([]) }),
    );

    expect(toast.showSuccess).toHaveBeenCalledWith('Upit je uspešno obrisan.');
  });

  it('does not delete when the dialog is cancelled', async () => {
    dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
    await load();

    getButton(element, 'Obriši upit')!.click();
    await settle();

    http.expectNone(`${INQUIRIES_URL}/3`);
  });
});
