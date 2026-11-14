import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyIntro } from './privacy-intro';

describe('PrivacyIntro', () => {
  let component: PrivacyIntro;
  let fixture: ComponentFixture<PrivacyIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyIntro],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyIntro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
