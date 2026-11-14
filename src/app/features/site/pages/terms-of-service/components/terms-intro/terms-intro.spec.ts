import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsIntro } from './terms-intro';

describe('TermsIntro', () => {
  let component: TermsIntro;
  let fixture: ComponentFixture<TermsIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsIntro],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsIntro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
