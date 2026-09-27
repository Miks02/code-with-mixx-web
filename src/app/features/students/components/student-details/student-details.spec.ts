import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '../../../../core/models/account-status';
import { dateConverter } from '../../../../core/utilities/date-helpers';
import { StudentItem } from '../../models/student-item';
import { StudentDetails } from './student-details';

const baseStudent: StudentItem = {
  id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  firstName: 'Marko',
  lastName: 'Jovanović',
  email: 'marko.jovanovic@example.com',
  phoneNumber: '+381601234567',
  university: 'Elektrotehnički fakultet',
  totalReservations: 14,
  totalClasses: 12,
  totalProjects: 3,
  registeredAt: '2025-09-15T10:24:00Z',
  deletedAt: null,
  accountStatus: AccountStatus.Active,
};

function buttonLabels(fixture: ComponentFixture<StudentDetails>): string[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('app-button')).map((btn) =>
    btn.textContent!.trim(),
  );
}

describe('StudentDetails', () => {
  let component: StudentDetails;
  let fixture: ComponentFixture<StudentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the empty state when no student is selected', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Izaberite studenta iz liste kako bi prikazali detalje',
    );
  });

  it('should return an empty stats array when no student is selected', () => {
    expect(component.stats()).toEqual([]);
  });

  describe('when the student is active', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('student', baseStudent);
      fixture.detectChanges();
    });

    it('should render the student full name', () => {
      const heading = fixture.nativeElement.querySelector('h2');
      expect(heading.textContent).toContain('Marko Jovanović');
    });

    it('should show the "Aktivan" status badge', () => {
      expect(fixture.nativeElement.textContent).toContain('Aktivan');
    });

    it('should not render the invite button', () => {
      const inviteButton = fixture.nativeElement.querySelector(
        'button[title="Pošalji pozivnicu"]',
      );
      expect(inviteButton).toBeNull();
    });

    it('should show the registration date at the far right of the header', () => {
      expect(fixture.nativeElement.textContent).toContain(
        `Registrovan: ${dateConverter(baseStudent.registeredAt)}`,
      );
    });

    it('should compute stats for reservations, classes, projects and university', () => {
      expect(component.stats()).toEqual([
        { icon: 'faSolidCalendarCheck', value: 14, label: 'Rezervacije', tone: 'default' },
        { icon: 'faSolidCalendar', value: 12, label: 'Časovi', tone: 'default' },
        { icon: 'faSolidDiagramProject', value: 3, label: 'Projekti', tone: 'default' },
        {
          icon: 'faSolidGraduationCap',
          value: 'Elektrotehnički fakultet',
          label: 'Fakultet',
          tone: 'default',
        },
      ]);
    });

    it('should show "Nije upisan" when the student has no university', () => {
      fixture.componentRef.setInput('student', { ...baseStudent, university: null });
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Nije upisan');
    });

    it('should render the email, phone number and id', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain(baseStudent.email);
      expect(text).toContain(baseStudent.phoneNumber);
      expect(text).toContain(baseStudent.id);
    });

    it('should render all four action buttons', () => {
      expect(buttonLabels(fixture)).toEqual([
        'Detaljniji pregled',
        'Izmeni',
        'Deaktiviraj nalog',
        'Obriši',
      ]);
    });

    it('should not disable any action button', () => {
      const buttons = Array.from<HTMLButtonElement>(
        fixture.nativeElement.querySelectorAll('app-button button'),
      );
      expect(buttons.every((btn) => !btn.disabled)).toBe(true);
    });
  });

  describe('when the student is pending', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('student', {
        ...baseStudent,
        accountStatus: AccountStatus.Pending,
      });
      fixture.detectChanges();
    });

    it('should show the "Na čekanju" status badge', () => {
      expect(fixture.nativeElement.textContent).toContain('Na čekanju');
    });

    it('should render the invite button next to the student name', () => {
      const inviteButton = fixture.nativeElement.querySelector(
        'button[title="Pošalji pozivnicu"]',
      );
      expect(inviteButton).not.toBeNull();
    });
  });

  describe('when the student is deactivated', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('student', {
        ...baseStudent,
        accountStatus: AccountStatus.Deactivated,
      });
      fixture.detectChanges();
    });

    it('should show the "Deaktiviran" status badge', () => {
      expect(fixture.nativeElement.textContent).toContain('Deaktiviran');
    });

    it('should still render all four action buttons', () => {
      expect(buttonLabels(fixture)).toEqual([
        'Detaljniji pregled',
        'Izmeni',
        'Deaktiviraj nalog',
        'Obriši',
      ]);
    });
  });

  describe('when the student is deleted', () => {
    const deletedAt = '2026-06-18T08:00:00Z';

    beforeEach(() => {
      fixture.componentRef.setInput('student', {
        ...baseStudent,
        accountStatus: AccountStatus.Deleted,
        deletedAt,
      });
      fixture.detectChanges();
    });

    it('should show "Nalog obrisan" instead of the student name', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Nalog obrisan');
      expect(text).not.toContain('Marko Jovanović');
      expect(fixture.nativeElement.querySelector('h2')).toBeNull();
    });

    it('should show the deletion date', () => {
      expect(fixture.nativeElement.textContent).toContain(dateConverter(deletedAt));
    });

    it('should only render the "Detaljniji pregled" button', () => {
      expect(buttonLabels(fixture)).toEqual(['Detaljniji pregled']);
    });

    it('should not render the invite button', () => {
      const inviteButton = fixture.nativeElement.querySelector(
        'button[title="Pošalji pozivnicu"]',
      );
      expect(inviteButton).toBeNull();
    });
  });
});
