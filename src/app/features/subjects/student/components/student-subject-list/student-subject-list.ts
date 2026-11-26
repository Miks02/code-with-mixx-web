import { Component, inject } from '@angular/core';
import { PagedList } from '@shared/components/paged-list/paged-list';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { SubjectCard } from '@features/subjects/components/subject-card/subject-card';
import { StudentSubjectItem } from '@features/subjects/student/models/student-subject-item';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { StudentSubjectStore } from '@features/subjects/student/stores/student-subject-store';

@Component({
  imports: [PagedList, SearchBar, SortMenu, SubjectCard],
  selector: 'app-student-subject-list',
  templateUrl: './student-subject-list.html',
})
export class StudentSubjectList {
  protected store = inject(StudentSubjectStore);

  protected sort: Record<SubjectSort, string> = {
    [SubjectSort.NameAscending]: 'Po imenu (A-Z)',
    [SubjectSort.NameDescending]: 'Po imenu (Z-A)',
    [SubjectSort.CreatedAscending]: 'Po datumu - stariji',
    [SubjectSort.CreatedDescending]: 'Po datumu - noviji',
  };

  protected toggleSubject(subject: StudentSubjectItem) {
    this.store.selectSubject(subject.id === this.store.selectedSubjectId() ? undefined : subject);
  }
}
