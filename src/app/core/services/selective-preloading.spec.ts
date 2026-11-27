import { TestBed } from '@angular/core/testing';
import { SelectivePreloading } from './selective-preloading';

describe('SelectivePreloading', () => {
  let service: SelectivePreloading;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectivePreloading);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
