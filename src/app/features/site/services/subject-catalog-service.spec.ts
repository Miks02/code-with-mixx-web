import { TestBed } from '@angular/core/testing';
import { SubjectCatalogService } from './subject-catalog-service';

describe('SubjectCatalogService', () => {
  let service: SubjectCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubjectCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should place every subject in exactly one group', () => {
    const grouped = service.groups.flatMap((group) => group.subjects);

    expect(grouped.length).toBe(service.subjects.length);
  });

  it('should give every subject a unique id', () => {
    const ids = new Set(service.subjects.map((subject) => subject.id));

    expect(ids.size).toBe(service.subjects.length);
  });
});
