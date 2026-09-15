import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsList } from './subjects-list';

describe('SubjectsList', () => {
  let component: SubjectsList;
  let fixture: ComponentFixture<SubjectsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsList],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pagedSubjects', {
      items: [],
      totalCount: 0,
      pageSize: 15,
      paginatedCount: 0,
      pageNumber: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton placeholders when isPending is true', () => {
    fixture.componentRef.setInput('isPending', true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
