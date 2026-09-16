import { TestBed } from '@angular/core/testing';
import { ComponentMounter } from './component-mounter';

describe('ComponentMounter', () => {
  let service: ComponentMounter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentMounter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
