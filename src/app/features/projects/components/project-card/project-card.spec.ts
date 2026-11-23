import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectListItem } from '@features/projects/models/project-reservation-item';
import { createProjectListItem } from '@features/projects/testing/project-test-utils';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  let fixture: ComponentFixture<ProjectCard>;

  const render = async (overrides: Partial<ProjectListItem> = {}) => {
    fixture.componentRef.setInput('project', createProjectListItem(overrides));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectCard] }).compileComponents();
    fixture = TestBed.createComponent(ProjectCard);
  });

  it.each([
    [-20, 0],
    [40, 40],
    [130, 100],
  ])('keeps a progress of %i between 0 and 100 (%i)', async (progress, expected) => {
    await render({ progress });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(`${expected}%`);
  });

  it('shows the subject above the project name', async () => {
    await render({ name: 'Biblioteka', subjectName: 'Baze podataka' });
    const card = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="button"]',
    )!;
    const text = card.textContent!;

    expect(card.getAttribute('aria-label')).toBe('Detalji projekta Biblioteka');
    expect(text.indexOf('Baze podataka')).toBeLessThan(text.indexOf('Biblioteka'));
  });

  it('emits clicked on click and on Enter', async () => {
    await render();
    const clicked = vi.fn();
    fixture.componentInstance.clicked.subscribe(clicked);
    const card = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="button"]',
    )!;

    card.click();
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(clicked).toHaveBeenCalledTimes(2);
  });
});
