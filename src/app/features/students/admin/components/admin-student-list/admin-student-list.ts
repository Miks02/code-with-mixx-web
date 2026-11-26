import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPlus, faSolidUserSlash } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { PagedList } from '@shared/components/paged-list/paged-list';
import { FilterContainer } from '@shared/components/filter-container/filter-container';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { SortMenu } from '@shared/components/sort-menu/sort-menu';
import { StudentFilter } from '@features/students/models/student-filter';
import { StudentSort } from '@features/students/models/student-sort';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';
import { StudentCard } from '../student-card/student-card';

const CONFLICTING_FILTERS: Record<StudentFilter, StudentFilter[]> = {
  [StudentFilter.WithClasses]: [StudentFilter.WithoutClasses],
  [StudentFilter.WithoutClasses]: [StudentFilter.WithClasses],
  [StudentFilter.WithProjects]: [StudentFilter.WithoutProjects],
  [StudentFilter.WithoutProjects]: [StudentFilter.WithProjects],
  [StudentFilter.Active]: [],
  [StudentFilter.Deactivated]: [],
  [StudentFilter.Pending]: [],
  [StudentFilter.Deleted]: [StudentFilter.Active, StudentFilter.Deactivated, StudentFilter.Pending],
};

@Component({
  imports: [
    StudentCard,
    Button,
    SearchBar,
    SortMenu,
    FilterContainer,
    FilterMenu,
    NgIcon,
    PagedList,
  ],
  providers: [
    provideIcons({
      faSolidPlus,
      faSolidUserSlash,
    }),
  ],
  selector: 'app-admin-student-list',
  templateUrl: './admin-student-list.html',
})
export class AdminStudentList {
  protected store = inject(AdminStudentStore);

  protected conflictingFilters = CONFLICTING_FILTERS;

  protected sort: Record<StudentSort, string> = {
    [StudentSort.NameAscending]: 'Po imenu (A-Z)',
    [StudentSort.NameDescending]: 'Po imenu (Z-A)',
    [StudentSort.CreatedAscending]: 'Po datumu - stariji',
    [StudentSort.CreatedDescending]: 'Po datumu - noviji',
    [StudentSort.TotalReservationAscending]: 'Po rezervacijama - manje',
    [StudentSort.TotalReservationDescending]: 'Po rezervacijama - više',
  };

  protected filters: Record<StudentFilter, string> = {
    [StudentFilter.WithClasses]: 'Sa časovima',
    [StudentFilter.WithoutClasses]: 'Bez časova',
    [StudentFilter.WithProjects]: 'Sa projektima',
    [StudentFilter.WithoutProjects]: 'Bez projekata',
    [StudentFilter.Active]: 'Aktivni',
    [StudentFilter.Deactivated]: 'Deaktivirani',
    [StudentFilter.Pending]: 'Na čekanju',
    [StudentFilter.Deleted]: 'Obrisani',
  };
}
