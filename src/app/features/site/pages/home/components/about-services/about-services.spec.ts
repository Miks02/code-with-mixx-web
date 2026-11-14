import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutServices } from './about-services';

describe('AboutServices', () => {
  let component: AboutServices;
  let fixture: ComponentFixture<AboutServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutServices],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
