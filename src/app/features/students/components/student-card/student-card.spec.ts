import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '../../../../core/models/account-status';
import { StudentItem } from '../../models/student-item';
import { StudentCard } from './student-card';

const STUDENT: StudentItem = {
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

describe('StudentCard', () => {
  let component: StudentCard;
  let fixture: ComponentFixture<StudentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('student', STUDENT);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the student initials', () => {
    expect(component.studentInitials()).toBe('MJ');
  });

  it('should render labeled stats and the registration date', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Rezervacije');
    expect(text).toContain('Časovi');
    expect(text).toContain('Projekti');
    expect(text).toContain('Registrovan');
    expect(text).toContain('15.09.2025');
  });

  it('should use a subtle amber background for pending students', () => {
    fixture.componentRef.setInput('student', { ...STUDENT, accountStatus: AccountStatus.Pending });
    expect(component.containerClasses()).toContain('bg-amber-700/30');
  });

  it('should use a subtle red background for deactivated students', () => {
    fixture.componentRef.setInput('student', {
      ...STUDENT,
      accountStatus: AccountStatus.Deactivated,
    });
    expect(component.containerClasses()).toContain('bg-red-700/30');
  });

  it('should use a subtle red background for deleted students', () => {
    fixture.componentRef.setInput('student', { ...STUDENT, accountStatus: AccountStatus.Deleted });
    expect(component.containerClasses()).toContain('bg-red-900/30');
  });

  it('should match accent colors to the account status', () => {
    fixture.componentRef.setInput('student', {
      ...STUDENT,
      accountStatus: AccountStatus.Deactivated,
    });
    fixture.detectChanges();

    const avatar: HTMLElement = fixture.nativeElement.querySelector('.rounded-full');
    expect(avatar.classList).toContain('bg-red-400');
    expect(avatar.classList).toContain('h-10');
  });

  it('should dim the card when addOpacity is true', () => {
    fixture.componentRef.setInput('addOpacity', true);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('div');
    expect(host.style.opacity).toBe('0.5');
  });
});
