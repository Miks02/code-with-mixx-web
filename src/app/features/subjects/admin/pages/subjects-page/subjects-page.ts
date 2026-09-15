import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
    faSolidBook,
    faSolidBookOpen,
    faSolidBookSkull,
    faSolidCalendar,
    faSolidCheck,
    faSolidUserGraduate,
    faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { StatsCard } from '../../../components/stats-card/stats-card';
import { SubjectsList } from '../../../components/subjects-list/subjects-list';
import { SubjectItem } from '../../../models/subject-item';
import { SubjectService } from '../../../services/subject-service';
import { CreateSubjectForm } from '../../components/create-subject-form/create-subject-form';
import { EditSubjectForm } from '../../components/edit-subject-form/edit-subject-form';
import { MostPopularSubject } from '../../components/most-popular-subject/most-popular-subject';
import { SubjectDetails } from '../../components/subject-details/subject-details';

@Component({
  imports: [
    FormsModule,
    SubjectsList,
    SubjectDetails,
    MostPopularSubject,
    CreateSubjectForm,
    StatsCard,
    EditSubjectForm
  ],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidUserGraduate,
      faSolidBook,
      faSolidBookSkull,
      faSolidBookOpen,
      faSolidCheck,
      faSolidXmark
    }),
  ],
  selector: 'app-subjects-page',
  styleUrl: './subjects-page.css',
  templateUrl: './subjects-page.html',
})
export class SubjectsPage {
  private subjectService = inject(SubjectService);
  private searchTerm$ = new BehaviorSubject<string>('');
  private searchTerm = toSignal(this.searchTerm$.pipe(debounceTime(300)), { initialValue: '' });

  private pageNumber: WritableSignal<number> = signal(1);
  private pageSize: WritableSignal<number> = signal(15);

  subjectToEdit: WritableSignal<SubjectItem | null> = signal(null);

  subjectsSummarySource = this.subjectService.getSubjectsSummaryForAdminQuery(
    this.pageNumber,
    this.pageSize,
    this.searchTerm,
  );

  subjectsSource = this.subjectService.getPagedSubjectsForAdminQuery(
    this.subjectsSummarySource,
    this.pageNumber,
    this.pageSize,
    this.searchTerm,
  );

  subjectsSummary = computed(() => this.subjectsSummarySource.data());
  subjects = computed(() => this.subjectsSource?.data());
  selectedSubject: WritableSignal<SubjectItem | undefined> = signal(undefined);

  mostPopularSubject = computed(() => this.subjectsSummary()?.mostPopularSubject);

  onSearchChange(searchTerm: string) {
    this.pageNumber.set(1);
    this.searchTerm$.next(searchTerm);
  }

  onPageChanged(page: number) {
    this.pageNumber.set(page);
  }

  onSubjectSelected(subject: SubjectItem) {
    this.selectedSubject.set(subject);
  }
}
