import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsList } from './students-list';

describe('StudentsList', () => {
  let component: StudentsList;
  let fixture: ComponentFixture<StudentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsList],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pagedStudents', {
      items: [],
      totalCount: 0,
      pageSize: 5,
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
