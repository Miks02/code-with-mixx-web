import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { CreateSubjectForm } from './create-subject-form';

describe('CreateSubjectForm', () => {
  let component: CreateSubjectForm;
  let fixture: ComponentFixture<CreateSubjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSubjectForm],
      providers: [provideHttpClient(), provideTanStackQuery(new QueryClient())],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSubjectForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
