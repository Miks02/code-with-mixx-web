import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextClassCard } from './next-class-card';

describe('NextClassCard', () => {
  let component: NextClassCard;
  let fixture: ComponentFixture<NextClassCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextClassCard],
    }).compileComponents();

    fixture = TestBed.createComponent(NextClassCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('nextClass', null);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
