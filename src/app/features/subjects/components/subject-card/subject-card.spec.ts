import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectCard } from './subject-card';

describe('SubjectCard', () => {
  let fixture: ComponentFixture<SubjectCard>;
  let element: HTMLElement;

  const button = () => element.querySelector('button')!;
  const counts = () => Array.from(element.querySelectorAll('span')).map((span) => span.textContent);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SubjectCard] }).compileComponents();

    fixture = TestBed.createComponent(SubjectCard);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('subjectName', 'Osnove programiranja');
    fixture.componentRef.setInput('subjectDescription', 'Promenljive, petlje i funkcije');
    await fixture.whenStable();
  });

  it('renders the name and description without counts when none are passed', () => {
    expect(element.textContent).toContain('Osnove programiranja');
    expect(element.textContent).toContain('Promenljive, petlje i funkcije');
    expect(element.querySelectorAll('ng-icon').length).toBe(0);
  });

  it('renders only the counts that are passed, including zero', async () => {
    fixture.componentRef.setInput('classesCount', 0);
    await fixture.whenStable();

    expect(element.querySelectorAll('ng-icon').length).toBe(1);
    expect(counts()).toContain('0');

    fixture.componentRef.setInput('studentsCount', 7);
    await fixture.whenStable();

    expect(element.querySelectorAll('ng-icon').length).toBe(2);
    expect(counts()).toContain('7');
  });

  it('emits when clicked', () => {
    let emitted = 0;
    fixture.componentInstance.selected.subscribe(() => emitted++);

    button().click();

    expect(emitted).toBe(1);
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
