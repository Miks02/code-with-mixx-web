import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StudentLookup as StudentLookupItem, StudentService } from '@features/students';
import { StudentLookup } from './student-lookup';

const STUDENTS: StudentLookupItem[] = [
  { id: 'student-1', fullName: 'Ana Anić', email: 'ana@example.com' },
  { id: 'student-2', fullName: 'Marko Marković', email: 'marko@example.com' },
  { id: 'student-3', fullName: 'Jovana Jović', email: 'jovana@fon.rs' },
];

describe('StudentLookup', () => {
  let component: StudentLookup;
  let fixture: ComponentFixture<StudentLookup>;
  let router: Router;

  const studentService = { getStudentsLookupQuery: () => ({ data: signal(STUDENTS) }) };

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
      imports: [StudentLookup],
      providers: [provideRouter([]), { provide: StudentService, useValue: studentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentLookup);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
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
});
