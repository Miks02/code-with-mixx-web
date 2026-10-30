import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { ClassReservationDetails } from './class-reservation-details';

describe('ClassReservationDetails', () => {
  let component: ClassReservationDetails;
  let fixture: ComponentFixture<ClassReservationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassReservationDetails],
      providers: [provideHttpClient(), provideTanStackQuery(new QueryClient())],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassReservationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
