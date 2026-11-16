import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProjectReservationList } from './admin-project-reservation-list';

describe('AdminProjectReservationList', () => {
  let component: AdminProjectReservationList;
  let fixture: ComponentFixture<AdminProjectReservationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProjectReservationList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProjectReservationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
