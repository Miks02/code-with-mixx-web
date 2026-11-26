import { PagedResult } from '@core/models/paged-result';
import { StudentSubjectItem } from './student-subject-item';

export type LastSubjectClass = {
  subjectName: string;
  classDate: string;
};

export type StudentSubjectsSummary = {
  pagedSubjects: PagedResult<StudentSubjectItem>;
  totalSubjects: number;
  taughtSubjects: number;
  untaughtSubjects: number;
  mostPopularSubject: StudentSubjectItem | null;
  lastSubjectClass: LastSubjectClass | null;
};
