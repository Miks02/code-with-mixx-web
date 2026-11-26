import { SubjectSort } from '@features/subjects/models/subject-sort';

export type StudentSubjectParams = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortBy: SubjectSort;
};
