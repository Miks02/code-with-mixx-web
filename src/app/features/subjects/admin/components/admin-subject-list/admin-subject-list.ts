import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronLeft, faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { SubjectCard } from '@features/subjects/components/subject-card/subject-card';
import { SubjectSort } from '@features/subjects/models/subject-sort';
import { AdminSubjectStore } from '@features/subjects/admin/stores/admin-subject-store';

@Component({
  imports: [SubjectCard, Button, SearchBar, SortMenu, NgIcon, Skeleton],
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
  selector: 'app-admin-subject-list',
  styleUrl: './admin-subject-list.css',
  templateUrl: './admin-subject-list.html',
})
export class AdminSubjectList {
  protected store = inject(AdminSubjectStore);

  protected skeletonItems = Array.from({ length: 6 });

  protected sort: Record<SubjectSort, string> = {
    [SubjectSort.NameAscending]: 'Po imenu (A-Z)',
    [SubjectSort.NameDescending]: 'Po imenu (Z-A)',
    [SubjectSort.CreatedAscending]: 'Po datumu - stariji',
    [SubjectSort.CreatedDescending]: 'Po datumu - noviji',
  };
}
