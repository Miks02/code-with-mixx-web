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
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: Router;

  const studentService = { getStudentsLookupQuery: { data: signal(STUDENTS) } };
  const userState = { fullName: signal('Admin Adminović') };

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(): HTMLInputElement {
    return element().querySelector<HTMLInputElement>('#search')!;
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

  function options(): HTMLElement[] {
    return Array.from(element().querySelectorAll<HTMLElement>('[role="option"]'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: UserState, useValue: userState },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show results before typing', () => {
    expect(element().querySelector('[role="listbox"]')).toBeNull();
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('should show students whose email matches the search', async () => {
    await type('EXAMPLE');

    expect(options().map((o) => o.textContent)).toEqual([
      expect.stringContaining('Ana Anić'),
      expect.stringContaining('Marko Marković'),
    ]);
    expect(input().getAttribute('aria-expanded')).toBe('true');
  });

  it('should link each result to the student details page', async () => {
    await type('fon.rs');

    const link = options()[0].querySelector('a');
    expect(link?.getAttribute('href')).toBe('/admin/students/details/student-3');
  });

  it('should show an empty message when nothing matches', async () => {
    await type('nema-takvog');

    expect(options().length).toBe(0);
    expect(element().textContent).toContain('Nijedan student ne odgovara pretrazi.');
  });

  it('should move the active option with the arrow keys and wrap around', async () => {
    await type('example');

    await press('ArrowDown');
    expect(component.activeIndex()).toBe(0);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');

    await press('ArrowDown');
    await press('ArrowDown');
    expect(component.activeIndex()).toBe(0);

    await press('ArrowUp');
    expect(component.activeIndex()).toBe(1);
  });

  it('should open the active student on Enter and clear the search', async () => {
    await type('example');
    await press('ArrowDown');
    await press('ArrowDown');
    await press('Enter');

    expect(router.navigate).toHaveBeenCalledWith(['/admin/students/details', 'student-2']);
    expect(component.searchString()).toBe('');
    expect(element().querySelector('[role="listbox"]')).toBeNull();
  });

  it('should open the only result on Enter without selecting it first', async () => {
    await type('jovana');
    await press('Enter');

    expect(router.navigate).toHaveBeenCalledWith(['/admin/students/details', 'student-3']);
  });

  it('should not navigate on Enter when several results match and none is active', async () => {
    await type('example');
    await press('Enter');

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should close the results on Escape but keep the search', async () => {
    await type('example');
    await press('Escape');

    expect(element().querySelector('[role="listbox"]')).toBeNull();
    expect(component.searchString()).toBe('example');
  });

  it('should clear the search after clicking a result', async () => {
    await type('ana');
    options()[0].querySelector('a')!.click();
    await fixture.whenStable();

    expect(component.searchString()).toBe('');
    expect(input().value).toBe('');
  });
  describe('mobile search button', () => {
    function toggleButton(): HTMLButtonElement {
      return element().querySelector<HTMLButtonElement>('button[aria-controls="student-search"]')!;
    }

    function panel(): HTMLElement {
      return element().querySelector<HTMLElement>('#student-search')!;
    }

    it('should keep the search panel hidden on mobile by default', () => {
      expect(panel().classList).toContain('hidden');
      expect(toggleButton().getAttribute('aria-expanded')).toBe('false');
    });

    it('should open the same search input and focus it', async () => {
      toggleButton().click();
      await fixture.whenStable();

      expect(panel().classList).not.toContain('hidden');
      expect(panel().classList).toContain('absolute');
      expect(toggleButton().getAttribute('aria-expanded')).toBe('true');
      expect(element().querySelectorAll('#search').length).toBe(1);
      expect(document.activeElement).toBe(input());
    });

    it('should close the panel when clicked again', async () => {
      toggleButton().click();
      await fixture.whenStable();
      toggleButton().click();
      await fixture.whenStable();

      expect(panel().classList).toContain('hidden');
      expect(component.isMobileSearchOpen()).toBe(false);
    });

    it('should close the panel on Escape', async () => {
      toggleButton().click();
      await fixture.whenStable();
      await press('Escape');

      expect(component.isMobileSearchOpen()).toBe(false);
    });

    it('should close the panel after a student is opened', async () => {
      toggleButton().click();
      await fixture.whenStable();
      await type('jovana');
      await press('Enter');

      expect(router.navigate).toHaveBeenCalledWith(['/admin/students/details', 'student-3']);
      expect(component.isMobileSearchOpen()).toBe(false);
    });
  });
});
