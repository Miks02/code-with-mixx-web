import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidUserCheck,
  faSolidUserClock,
  faSolidUserSlash,
  faSolidUserXmark,
} from '@ng-icons/font-awesome/solid';
import { StatsCard } from '@shared/components/stats-card/stats-card';
import { AdminStudentList } from '@features/students/admin/components/admin-student-list/admin-student-list';
import { CreateStudentForm } from '@features/students/admin/components/create-student-form/create-student-form';
import { EditStudentForm } from '@features/students/admin/components/edit-student-form/edit-student-form';
import { MostActiveStudent } from '@features/students/admin/components/most-active-student/most-active-student';
import { StudentDetails } from '@features/students/admin/components/student-details/student-details';
import { AdminStudentStore } from '@features/students/admin/stores/admin-student-store';

@Component({
  imports: [
    AdminStudentList,
    StudentDetails,
    StatsCard,
    MostActiveStudent,
    CreateStudentForm,
    EditStudentForm,
  ],
  providers: [
    AdminStudentStore,
    provideIcons({ faSolidUserCheck, faSolidUserClock, faSolidUserSlash, faSolidUserXmark }),
  ],
  selector: 'app-students-page',
  styleUrl: './students-page.css',
  templateUrl: './students-page.html',
})
export class StudentsPage {
  protected store = inject(AdminStudentStore);
}
