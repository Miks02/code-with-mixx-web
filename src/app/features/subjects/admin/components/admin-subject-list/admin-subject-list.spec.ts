import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSubjectList } from './admin-subject-list';
import { AdminSubjectsStore } from '@features/subjects/admin/stores/admin-subject-store';

describe('AdminSubjectList', () => {
  let component: AdminSubjectList;
  let fixture: ComponentFixture<AdminSubjectList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubjectList],
      providers: [AdminSubjectsStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubjectList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
