import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LastSubjectClass } from './last-subject-class';

describe('LastSubjectClass', () => {
  let fixture: ComponentFixture<LastSubjectClass>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LastSubjectClass] }).compileComponents();

    fixture = TestBed.createComponent(LastSubjectClass);
    element = fixture.nativeElement;
  });

  it('shows the subject and the class date as a local calendar day', async () => {
    fixture.componentRef.setInput('lastClass', {
      subjectName: 'Baze podataka',
      classDate: '2026-11-01',
    });
    await fixture.whenStable();

    expect(element.textContent).toContain('Baze podataka');
    expect(element.textContent).toContain('1. novembar 2026');
  });

  it('shows a message when there is no class yet', async () => {
    fixture.componentRef.setInput('lastClass', undefined);
    await fixture.whenStable();

    expect(element.textContent).toContain('Još nema održanih časova');
  });

  it('shows skeletons instead of content while pending', async () => {
    fixture.componentRef.setInput('isPending', true);
    await fixture.whenStable();

    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(element.textContent).not.toContain('Poslednji čas');
  });
});
