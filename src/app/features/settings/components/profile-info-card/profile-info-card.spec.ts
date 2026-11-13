import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatus } from '@core/models/account-status';
import { ProfileInfoCard } from './profile-info-card';

describe('ProfileInfoCard', () => {
  let component: ProfileInfoCard;
  let fixture: ComponentFixture<ProfileInfoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileInfoCard);
    fixture.componentRef.setInput('user', {
      firstName: 'Pera',
      lastName: 'Perić',
      email: 'pera@example.com',
      phoneNumber: '0601234567',
      roles: ['Student'],
      lastLogin: '2026-11-13T22:39:00Z',
      accountStatus: AccountStatus.Active,
      activeSessions: [],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
