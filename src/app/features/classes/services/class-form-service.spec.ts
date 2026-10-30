import { TestBed } from '@angular/core/testing';
import { ClassFormService } from './class-form-service';

describe('ClassFormService', () => {
  let service: ClassFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
