import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '@core/models/account-status';
import { dateConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { provideHttpTesting, settle } from '@core/testing/test-utils';
import { AdminStudentDetailsStore } from '@features/students/admin/stores/admin-student-details-store';
import {
  createStudentDetails,
  createStudentProfile,
  createStudentStats,
  flushStudentDetails,
  provideStudentRoute,
} from '@features/students/testing/student-test-utils';
import { StudentProfile } from './student-profile';

describe('StudentProfile', () => {
  let fixture: ComponentFixture<StudentProfile>;
  let element: HTMLElement;
  let http: HttpTestingController;

  const row = (label: string) =>
    Array.from(element.querySelectorAll('dl > div'))
      .find((item) => item.querySelector('dt')?.textContent?.trim() === label)
      ?.querySelector('dd')
      ?.textContent?.trim();
  const remaining = () => element.querySelector<HTMLElement>('span.text-xl')!;

  const load = async (details = createStudentDetails()) => {
    await flushStudentDetails(details);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentProfile],
      providers: [AdminStudentDetailsStore, provideStudentRoute(), provideHttpTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfile);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows skeletons until the details arrive', async () => {
    await settle();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);
    expect(element.querySelector('h1')).toBeNull();

    await load();
    expect(element.querySelector('app-skeleton')).toBeNull();
  });

  it('shows the name, initials and contact data', async () => {
    await load();

    expect(element.querySelector('h1')?.textContent).toContain('Marko Jovanović');
    expect(element.textContent).toContain('MJ');
    expect(row('Email')).toBe('marko.jovanovic@example.com');
    expect(row('Telefon')).toBe('+381601234567');
    expect(row('Fakultet')).toBe('Elektrotehnički fakultet');
    expect(row('Registrovan')).toBe(dateConverter('2025-09-15T10:24:00Z'));
  });

  it('marks missing optional data instead of leaving it blank', async () => {
    await load(
      createStudentDetails({
        student: createStudentProfile({ phoneNumber: null, university: null, lastLoginAt: null }),
      }),
    );

    expect(row('Telefon')).toBe('Nije upisan');
    expect(row('Fakultet')).toBe('Nije upisan');
    expect(row('Poslednja prijava')).toBe('Nikad');
  });

  it('shows when a deleted account was deleted', async () => {
    await load(
      createStudentDetails({
        student: createStudentProfile({
          accountStatus: AccountStatus.Deleted,
          deletedAt: '2026-03-01T08:00:00Z',
        }),
      }),
    );

    expect(element.textContent).toContain('Obrisan');
    expect(element.textContent).toContain(`Obrisan ${dateConverter('2026-03-01T08:00:00Z')}`);
  });

  it('shows the finances and highlights an unpaid balance', async () => {
    await load();

    expect(element.textContent).toContain(priceConverter(15600));
    expect(element.textContent).toContain(priceConverter(9100));
    expect(remaining().textContent).toContain(priceConverter(6500));
    expect(remaining().classList).toContain('text-amber-400');
  });

  it('does not highlight the balance when everything is paid', async () => {
    await load(
      createStudentDetails({
        stats: createStudentStats({ totalPaid: 15600, totalRemaining: 0 }),
      }),
    );

    expect(remaining().textContent).toContain(priceConverter(0));
    expect(remaining().classList).not.toContain('text-amber-400');
  });
});
