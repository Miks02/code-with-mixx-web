import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ClassesPage } from './classes-page';

describe('ClassesPage', () => {
  let component: ClassesPage;
  let fixture: ComponentFixture<ClassesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesPage],
      providers: [provideHttpClient(), provideTanStackQuery(new QueryClient())],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
