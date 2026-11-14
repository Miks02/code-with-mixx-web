import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PrivacySections } from './privacy-sections';

describe('PrivacySections', () => {
  let component: PrivacySections;
  let fixture: ComponentFixture<PrivacySections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySections],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacySections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
