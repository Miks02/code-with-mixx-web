import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostPopularSubject } from './most-popular-subject';

describe('MostPopularSubject', () => {
  let fixture: ComponentFixture<MostPopularSubject>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MostPopularSubject] }).compileComponents();

    fixture = TestBed.createComponent(MostPopularSubject);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('subjectName', 'Osnove programiranja');
    fixture.componentRef.setInput('classesCount', 12);
    fixture.componentRef.setInput('studentsCount', 30);
    await fixture.whenStable();
  });

  it('shows skeletons instead of content while pending', async () => {
    fixture.componentRef.setInput('isPending', true);
    await fixture.whenStable();

    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(element.textContent).not.toContain('Osnove programiranja');
  });

  it('shows the subject name, classes count and students count', () => {
    expect(element.querySelector('app-skeleton')).toBeNull();
    expect(element.textContent).toContain('Osnove programiranja');
    expect(element.textContent).toMatch(/12\s*održanih časova/);
    expect(element.textContent).toMatch(/30\s*studenata/);
  });

  it('hides the students count when it is not given', async () => {
    fixture.componentRef.setInput('studentsCount', undefined);
    await fixture.whenStable();

    expect(element.textContent).toMatch(/12\s*održanih časova/);
    expect(element.textContent).not.toContain('studenata');
  });
});
