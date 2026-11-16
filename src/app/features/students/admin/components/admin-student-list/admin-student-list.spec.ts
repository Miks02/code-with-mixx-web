import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminStudentList } from './admin-student-list';

describe('AdminStudentList', () => {
  let component: AdminStudentList;
  let fixture: ComponentFixture<AdminStudentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStudentList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStudentList);
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
