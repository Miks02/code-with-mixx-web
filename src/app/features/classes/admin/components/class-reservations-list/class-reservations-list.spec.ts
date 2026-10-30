import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassReservationsList } from './class-reservations-list';

describe('ClassReservationsList', () => {
  let component: ClassReservationsList;
  let fixture: ComponentFixture<ClassReservationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationsList],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationsList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pagedReservations', undefined);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
