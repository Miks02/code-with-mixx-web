import { SubjectSort } from './subject-sort';

export type StudentSubjectParams = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortBy: SubjectSort;
};
