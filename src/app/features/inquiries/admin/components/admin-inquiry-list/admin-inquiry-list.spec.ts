import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogResult } from '@core/components/dialog/dialog';
import {
  createDialogServiceMock,
  createToastServiceMock,
  getButton,
  provideHttpTesting,
  settle,
  typeInto,
  wait,
} from '@core/testing/test-utils';
import { AdminInquiryStore } from '@features/inquiries/admin/stores/admin-inquiry-store';
import {
  createInquiriesSummary,
  createInquiry,
  createPagedInquiries,
  expectInquiriesRequest,
  flushInquiriesSummary,
  INQUIRIES_URL,
} from '@features/inquiries/testing/inquiry-test-utils';
import { AdminInquiryList } from './admin-inquiry-list';

describe('AdminInquiryList', () => {
  let fixture: ComponentFixture<AdminInquiryList>;
  let element: HTMLElement;
  let store: InstanceType<typeof AdminInquiryStore>;
  let http: HttpTestingController;
  let toast: ReturnType<typeof createToastServiceMock>;
  let dialog: ReturnType<typeof createDialogServiceMock>;

  const firstPage = createPagedInquiries(
    [createInquiry({ id: 1 }), createInquiry({ id: 2, firstName: 'Marko', lastName: 'Marković' })],
    { totalCount: 3, totalPages: 2, hasNextPage: true },
  );

  const cards = () => Array.from(element.querySelectorAll<HTMLElement>('app-inquiry-card'));
  const cardBody = (index: number) => cards()[index].querySelector<HTMLElement>('[role="button"]')!;
  const cardCheckbox = (index: number) =>
    cards()[index].querySelector<HTMLButtonElement>('button[role="checkbox"]')!;
  const selectAll = () => getButton(element, 'Označi sve na strani')!;
  const pageButton = (label: string) =>
    element.querySelector<HTMLButtonElement>(`app-button[aria-label="${label}"] button`)!;

  beforeEach(async () => {
    toast = createToastServiceMock();
    dialog = createDialogServiceMock();

    await TestBed.configureTestingModule({
      imports: [AdminInquiryList],
      providers: [
        AdminInquiryStore,
        provideHttpTesting({ toastService: toast, dialogService: dialog }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminInquiryList);
    element = fixture.nativeElement;
    store = TestBed.inject(AdminInquiryStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    await flushInquiriesSummary();
    http.verify();
  });

  it('shows skeletons while loading', async () => {
    await settle();
    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(cards().length).toBe(0);
    expect(selectAll().disabled).toBe(true);
  });

  it('shows the empty state when there are no inquiries', async () => {
    await flushInquiriesSummary(
      createInquiriesSummary({ pagedInquiries: createPagedInquiries([]) }),
    );
    await fixture.whenStable();

    expect(cards().length).toBe(0);
    expect(element.textContent).toContain('Nije pronađen nijedan upit');
  });

  describe('with loaded inquiries', () => {
    beforeEach(async () => {
      await flushInquiriesSummary(createInquiriesSummary({ pagedInquiries: firstPage }));
      await fixture.whenStable();
    });

    it('renders a card per inquiry and the pagination summary', () => {
      expect(cards().length).toBe(2);
      expect(element.textContent).toContain('Prikazano 2 od 3');
      expect(element.textContent).toMatch(/1\s*\/\s*2/);
    });

    it('marks the automatically selected first inquiry', () => {
      expect(cardBody(0).getAttribute('aria-pressed')).toBe('true');
      expect(cardBody(1).getAttribute('aria-pressed')).toBe('false');
    });

    it('selects a card on click and deselects it on a second click', async () => {
      cardBody(1).click();
      await fixture.whenStable();
      expect(store.selectedInquiryId()).toBe(2);
      expect(cardBody(1).getAttribute('aria-pressed')).toBe('true');

      cardBody(1).click();
      await fixture.whenStable();
      expect(store.selectedInquiry()).toBeUndefined();
    });

    it('checks a card from its checkbox without selecting it', async () => {
      cardCheckbox(1).click();
      await fixture.whenStable();

      expect(store.checkedIds()).toEqual([2]);
      expect(store.selectedInquiryId()).toBe(1);
      expect(cardCheckbox(1).getAttribute('aria-checked')).toBe('true');
      expect(element.textContent).toContain('Označeno: 1');
    });

    it('checks and unchecks the whole page', async () => {
      selectAll().click();
      await fixture.whenStable();
      expect(store.checkedIds()).toEqual([1, 2]);
      expect(selectAll().getAttribute('aria-checked')).toBe('true');

      selectAll().click();
      await fixture.whenStable();
      expect(store.checkedIds()).toEqual([]);
    });

    it('shows the bulk delete action only while something is checked', async () => {
      expect(getButton(element, 'Obriši označene')).toBeUndefined();

      cardCheckbox(0).click();
      await fixture.whenStable();

      expect(getButton(element, 'Obriši označene')).toBeDefined();
    });

    it('deletes the checked inquiries after confirmation', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Confirmed);
      selectAll().click();
      await fixture.whenStable();

      getButton(element, 'Obriši označene')!.click();
      await settle();

      expect(dialog.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('(2)') }),
      );
      const request = http.expectOne((req) => req.url === INQUIRIES_URL && req.method === 'DELETE');
      expect(request.request.params.getAll('inquiryIds')).toEqual(['1', '2']);
      request.flush({ deletedCount: 2 });
      await flushInquiriesSummary();

      expect(toast.showSuccess).toHaveBeenCalledWith('Obrisano je upita: 2.');
    });

    it('does not delete when the dialog is cancelled', async () => {
      dialog.showDialog.mockResolvedValue(DialogResult.Cancelled);
      cardCheckbox(0).click();
      await fixture.whenStable();

      getButton(element, 'Obriši označene')!.click();
      await settle();

      http.expectNone((req) => req.url === INQUIRIES_URL && req.method === 'DELETE');
      expect(store.checkedIds()).toEqual([1]);
    });

    it('disables the previous page button and loads the next page', async () => {
      expect(pageButton('Prethodna strana').disabled).toBe(true);

      pageButton('Sledeća strana').click();
      await settle();

      expectInquiriesRequest({ pageNumber: '2' }).flush(
        createPagedInquiries([createInquiry({ id: 3, firstName: 'Jovana' })], {
          totalCount: 3,
          pageNumber: 2,
          totalPages: 2,
          hasPreviousPage: true,
        }),
      );
      await settle();
      await fixture.whenStable();

      expect(element.textContent).toContain('Jovana');
      expect(element.textContent).toMatch(/2\s*\/\s*2/);
      expect(pageButton('Sledeća strana').disabled).toBe(true);
    });

    it('passes the typed search term to the store (debounced)', async () => {
      typeInto(element.querySelector<HTMLInputElement>('app-search-bar input')!, 'marko');
      await wait(350);
      await settle();

      expect(store.params.searchTerm()).toBe('marko');
      expectInquiriesRequest({ searchTerm: 'marko' }).flush(createPagedInquiries([]));
      await settle();
    });
  });
});
