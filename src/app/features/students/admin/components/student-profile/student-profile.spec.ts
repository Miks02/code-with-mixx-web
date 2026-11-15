import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '@core/models/account-status';
import { priceConverter } from '@core/utilities/price-helpers';
import {
  StudentProfile as StudentProfileModel,
  StudentReservationsStats,
} from '@features/students/models/student-details';
import { StudentProfile } from './student-profile';

const STUDENT: StudentProfileModel = {
  id: 'student-1',
  firstName: 'Ana',
  lastName: 'Anić',
  email: 'ana@example.com',
  phoneNumber: '0601234567',
  university: 'FON',
  accountStatus: AccountStatus.Active,
  registeredAt: '2026-09-01T10:00:00Z',
  lastLoginAt: '2026-11-10T18:30:00Z',
  deletedAt: null,
};

const STATS: StudentReservationsStats = {
  totalReservations: 4,
  classReservations: 3,
  projectReservations: 1,
  totalClasses: 9,
  totalProjects: 1,
  overdueReservations: 1,
  totalPrice: 15600,
  totalPaid: 9100,
  totalRemaining: 6500,
};

describe('StudentProfile', () => {
  let fixture: ComponentFixture<StudentProfile>;
  let component: StudentProfile;

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  async function render(student?: StudentProfileModel, stats?: StudentReservationsStats) {
    fixture.componentRef.setInput('student', student);
    fixture.componentRef.setInput('stats', stats);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfile);
    component = fixture.componentInstance;
  });

  it('should render skeletons while pending', async () => {
    fixture.componentRef.setInput('isPending', true);
    await render(STUDENT, STATS);

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(text()).not.toContain('Ana Anić');
  });

  it('should render nothing without a student', async () => {
    await render();
    expect(text().trim()).toBe('');
  });

  describe('with a student', () => {
    beforeEach(() => render(STUDENT, STATS));

    it('should render the name, initials and status', () => {
      expect(text()).toContain('Ana Anić');
      expect(component.initials()).toBe('AA');
      expect(text()).toContain('Aktivan');
    });

    it('should render the contact details and id', () => {
      expect(text()).toContain('ana@example.com');
      expect(text()).toContain('0601234567');
      expect(text()).toContain('FON');
      expect(text()).toContain('student-1');
    });

    it('should render the finances and highlight the remaining amount', () => {
      expect(text()).toContain(priceConverter(15600));
      expect(text()).toContain(priceConverter(9100));
      expect(text()).toContain(priceConverter(6500));
      expect(component.hasRemaining()).toBe(true);
    });
  });

  it('should show fallbacks for missing phone, university and last login', async () => {
    await render({ ...STUDENT, phoneNumber: null, university: null, lastLoginAt: null }, STATS);

    const values = component.infoRows().map((row) => row.value);
    expect(values.filter((value) => value === 'Nije upisan').length).toBe(2);
    expect(values).toContain('Nikad');
  });

  it('should show the deleted status', async () => {
    await render(
      { ...STUDENT, accountStatus: AccountStatus.Deleted, deletedAt: '2026-11-01T10:00:00Z' },
      STATS,
    );

    expect(text()).toContain('Obrisan');
    expect(component.deletedAtLabel()).not.toBe('');
  });

  it('should not highlight the remaining amount when everything is paid', async () => {
    await render(STUDENT, { ...STATS, totalPaid: 15600, totalRemaining: 0 });
    expect(component.hasRemaining()).toBe(false);
  });
});
