import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBookOpen,
  faSolidBookSkull,
  faSolidBoxArchive,
  faSolidCalendar,
  faSolidCheck,
  faSolidUserGraduate,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { StatsCard } from '../../../components/stats-card/stats-card';
import { SubjectsList } from '../../../components/subjects-list/subjects-list';
import { SubjectItem } from '../../../models/subject-item';
import { SubjectSort } from '../../../models/subject-sort';
import { SubjectService } from '../../../services/subject-service';
import { CreateSubjectForm } from '../../components/create-subject-form/create-subject-form';
import { EditSubjectForm } from '../../components/edit-subject-form/edit-subject-form';
import { MostPopularSubject } from '../../components/most-popular-subject/most-popular-subject';
import { SubjectDetails } from '../../components/subject-details/subject-details';
import { ToastService } from '../../../../../core/services/toast-service';

@Component({
  imports: [
    FormsModule,
    SubjectsList,
    SubjectDetails,
    MostPopularSubject,
    CreateSubjectForm,
    StatsCard,
    EditSubjectForm,
  ],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidUserGraduate,
      faSolidBook,
      faSolidBookSkull,
      faSolidBookOpen,
      faSolidCheck,
      faSolidXmark,
      faSolidBoxArchive,
    }),
  ],
  selector: 'app-subjects-page',
  styleUrl: './subjects-page.css',
  templateUrl: './subjects-page.html',
})
export class SubjectsPage {
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);

  private searchTerm$ = new BehaviorSubject<string>('');
  private searchTerm = toSignal(this.searchTerm$.pipe(debounceTime(300)), { initialValue: '' });

  private pageNumber: WritableSignal<number> = signal(1);
  private pageSize: WritableSignal<number> = signal(15);
  onlyArchived: WritableSignal<boolean> = signal(false);
  selectedSort: WritableSignal<SubjectSort> = signal(SubjectSort.CreatedAscending);

  subjectToEdit: WritableSignal<SubjectItem | null> = signal(null);

  subjectsSummarySource = this.subjectService.getSubjectsSummaryForAdminQuery(
    this.pageNumber,
    this.pageSize,
    this.searchTerm,
    this.selectedSort,
    this.onlyArchived,
  );

  subjectsSource = this.subjectService.getPagedSubjectsForAdminQuery(
    this.subjectsSummarySource,
    this.pageNumber,
    this.pageSize,
    this.searchTerm,
    this.selectedSort,
    this.onlyArchived,
  );

  subjectsSummary = computed(() => this.subjectsSummarySource.data());
  subjects = computed(() => this.subjectsSource?.data());
  subjectsPending = computed(() => this.subjectsSource.isPending());
  subjectsFetching = computed(() => this.subjectsSource.isFetching());
  subjectsSummaryPending = computed(() => this.subjectsSummarySource.isPending());
  selectedSubject: WritableSignal<SubjectItem | undefined> = signal(undefined);

  mostPopularSubject = computed(() => this.subjectsSummary()?.mostPopularSubject);

  updateSelectedSubject(subject: SubjectItem) {
    this.selectedSubject.set(subject);
  }

  onSearchChange(searchTerm: string) {
    this.pageNumber.set(1);
    this.searchTerm$.next(searchTerm);
  }

  onSortChange(sort: SubjectSort) {
    this.selectedSort.set(sort);
  }

  onArchivedToggle(onlyDeleted: boolean) {
    this.pageNumber.set(1);
    this.onlyArchived.set(onlyDeleted);
  }

  onPageChanged(page: number) {
    this.pageNumber.set(page);
  }

  onSubjectSelected(subject: SubjectItem) {
    this.selectedSubject.set(subject);
  }
}
