import { Component, inject } from '@angular/core';
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
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { ScrollIntoViewOn } from '@shared/directives/scroll-into-view-on';
import { AdminSubjectList } from '@features/subjects/admin/components/admin-subject-list/admin-subject-list';
import { CreateSubjectForm } from '@features/subjects/admin/components/create-subject-form/create-subject-form';
import { EditSubjectForm } from '@features/subjects/admin/components/edit-subject-form/edit-subject-form';
import { MostPopularSubject } from '@features/subjects/components/most-popular-subject/most-popular-subject';
import { SubjectDetails } from '@features/subjects/admin/components/subject-details/subject-details';
import { AdminSubjectStore } from '@features/subjects/admin/stores/admin-subject-store';

@Component({
  imports: [
    FormsModule,
    AdminSubjectList,
    SubjectDetails,
    MostPopularSubject,
    CreateSubjectForm,
    StatsCard,
    EditSubjectForm,
    ScrollIntoViewOn,
  ],
  providers: [
    AdminSubjectStore,
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
  store = inject(AdminSubjectStore);
}
