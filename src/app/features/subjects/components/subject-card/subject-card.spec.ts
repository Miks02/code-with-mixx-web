import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectItem } from '@features/subjects/models/subject-item';
import { createSubject } from '@features/subjects/testing/subject-test-utils';
import { SubjectCard } from './subject-card';

describe('SubjectCard', () => {
  let fixture: ComponentFixture<SubjectCard>;
  let element: HTMLElement;
  const subject = createSubject();

  const button = () => element.querySelector('button')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SubjectCard] }).compileComponents();

    fixture = TestBed.createComponent(SubjectCard);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('subject', subject);
    await fixture.whenStable();
  });

  it('renders the name, description, classes count and students count', () => {
    expect(element.textContent).toContain('Osnove programiranja');
    expect(element.textContent).toContain('Promenljive, petlje i funkcije u JavaScript-u');
    const counts = Array.from(element.querySelectorAll('span')).map((span) => span.textContent);
    expect(counts).toContain('4');
    expect(counts).toContain('7');
  });

  it('emits the subject when clicked', () => {
    let emitted: SubjectItem | undefined;
    fixture.componentInstance.selected.subscribe((value) => (emitted = value));

    button().click();

    expect(emitted).toEqual(subject);
  });

  it('highlights the card when it is selected', async () => {
    expect(button().classList).not.toContain('bg-emerald-600');

    fixture.componentRef.setInput('isSelected', true);
    await fixture.whenStable();

    expect(button().classList).toContain('bg-emerald-600');
  });

  it('dims the card while the list is refetching', async () => {
    expect(button().style.opacity).toBe('');

    fixture.componentRef.setInput('addOpacity', true);
    await fixture.whenStable();

    expect(button().style.opacity).toBe('0.5');
  });
});
