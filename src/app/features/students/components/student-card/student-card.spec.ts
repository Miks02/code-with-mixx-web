import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentCard } from './student-card';

describe('StudentCard', () => {
  let component: StudentCard;
  let fixture: ComponentFixture<StudentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('student', {
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
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the student initials', () => {
    expect(component.studentInitials()).toBe('MJ');
  });

  it('should dim the card when addOpacity is true', () => {
    fixture.componentRef.setInput('addOpacity', true);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('div');
    expect(host.style.opacity).toBe('0.5');
  });
});
