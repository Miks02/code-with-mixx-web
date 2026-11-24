import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { UserState } from '@core/services/user-state';
import { StudentLookup, StudentService } from '@features/students';
import { Header } from './header';

const STUDENTS: StudentLookup[] = [
  { id: 'student-1', fullName: 'Ana Anić', email: 'ana@example.com' },
  { id: 'student-2', fullName: 'Marko Marković', email: 'marko@example.com' },
  { id: 'student-3', fullName: 'Jovana Jović', email: 'jovana@fon.rs' },
];

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let router: Router;

  const studentService = {
    getStudentsLookupQuery: vi.fn(() => ({ data: signal(STUDENTS) })),
  };
  const userState = { fullName: signal('Admin Adminović'), isAdmin: signal(true) };

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(): HTMLInputElement {
    return element().querySelector<HTMLInputElement>('#search')!;
  }

  function toggleButton(): HTMLButtonElement | null {
    return element().querySelector<HTMLButtonElement>('button[aria-controls="student-search"]');
  }

  function panel(): HTMLElement {
    return element().querySelector<HTMLElement>('#student-search')!;
  }

  async function type(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function press(key: string) {
    input().dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
    await fixture.whenStable();
  }

  async function render(isAdmin: boolean) {
    userState.isAdmin.set(isAdmin);
    fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    studentService.getStudentsLookupQuery.mockClear();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: UserState, useValue: userState },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  describe('for a non-admin', () => {
    beforeEach(() => render(false));

    it('should not render the student search or its mobile button', () => {
      expect(element().querySelector('app-student-lookup')).toBeNull();
      expect(toggleButton()).toBeNull();
    });

    it('should not create the admin students lookup query', () => {
      expect(studentService.getStudentsLookupQuery).not.toHaveBeenCalled();
    });
  });

  describe('mobile search button', () => {
    beforeEach(() => render(true));

    it('should keep the search panel hidden on mobile by default', () => {
      expect(panel().classList).toContain('hidden');
      expect(toggleButton()!.getAttribute('aria-expanded')).toBe('false');
    });

    it('should open the same search input and focus it', async () => {
      toggleButton()!.click();
      await fixture.whenStable();

      expect(panel().classList).not.toContain('hidden');
      expect(panel().classList).toContain('absolute');
      expect(toggleButton()!.getAttribute('aria-expanded')).toBe('true');
      expect(element().querySelectorAll('#search').length).toBe(1);
      expect(document.activeElement).toBe(input());
    });

    it('should close the panel when clicked again', async () => {
      toggleButton()!.click();
      await fixture.whenStable();
      toggleButton()!.click();
      await fixture.whenStable();

      expect(panel().classList).toContain('hidden');
      expect(toggleButton()!.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the panel on Escape', async () => {
      toggleButton()!.click();
      await fixture.whenStable();
      await press('Escape');

      expect(panel().classList).toContain('hidden');
      expect(toggleButton()!.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the panel after a student is opened', async () => {
      toggleButton()!.click();
      await fixture.whenStable();
      await type('jovana');
      await press('Enter');

      expect(router.navigate).toHaveBeenCalledWith(['/admin/students/details', 'student-3']);
      expect(panel().classList).toContain('hidden');
    });
  });
});
