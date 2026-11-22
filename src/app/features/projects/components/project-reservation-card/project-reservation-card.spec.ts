import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationStatus } from '@features/reservations';
import { ProjectReservationItem } from '@features/projects/models/project-reservation-item';
import {
  createProjectListItem,
  createProjectReservation,
} from '@features/projects/testing/project-test-utils';
import { ProjectReservationCard } from './project-reservation-card';

describe('ProjectReservationCard', () => {
  let fixture: ComponentFixture<ProjectReservationCard>;
  let element: HTMLElement;
  let selected: (ProjectReservationItem | undefined)[];

  const button = () => element.querySelector<HTMLButtonElement>('button')!;
  const render = async (overrides: Partial<ProjectReservationItem> = {}, isSelected = false) => {
    fixture.componentRef.setInput('reservation', createProjectReservation(overrides));
    fixture.componentRef.setInput('isSelected', isSelected);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectReservationCard] }).compileComponents();
    fixture = TestBed.createComponent(ProjectReservationCard);
    element = fixture.nativeElement;
    selected = [];
    fixture.componentInstance.selected.subscribe((reservation) => selected.push(reservation));
  });

  it('uses the first letters of the first two names as initials', async () => {
    await render({ studentFullName: '  ana   marija jovanović ' });
    expect(element.textContent).toContain('AM');
  });

  it('lists every subject of the reservation', async () => {
    await render({
      projects: [
        createProjectListItem({ id: 1, subjectName: 'Baze podataka' }),
        createProjectListItem({ id: 2, subjectName: 'Web programiranje' }),
      ],
    });
    expect(element.textContent).toContain('Baze podataka, Web programiranje');
  });

  it('selects on click and asks to clear the selection when it is already selected', async () => {
    await render();
    button().click();
    expect(selected[0]?.id).toBe(1);

    await render({}, true);
    button().click();
    expect(selected[1]).toBeUndefined();
  });

  it('uses the status color, and a stronger one when selected', async () => {
    await render({ reservationStatus: ReservationStatus.Cancelled });
    expect(button().className).toContain('bg-red-700/30');

    await render({ reservationStatus: ReservationStatus.Cancelled }, true);
    expect(button().className).toContain('bg-red-600/50');
  });

  it('shows the archive date only when archived', async () => {
    await render({
      reservationStatus: ReservationStatus.Completed,
      reservedAt: '2026-10-15T10:00:00Z',
    });
    expect(element.textContent).toContain('15.10.2026');
    expect(element.textContent).not.toContain('Arhivirana');

    await render({
      reservationStatus: ReservationStatus.Completed,
      deletedAt: '2026-11-03T10:00:00Z',
    });
    expect(element.textContent).toContain('Arhivirana');
    expect(element.textContent).toContain('03.11.2026');
  });
});
