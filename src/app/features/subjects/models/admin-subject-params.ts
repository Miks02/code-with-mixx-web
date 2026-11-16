import { SubjectSort } from './subject-sort';

export type AdminSubjectParams = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  onlyArchived: boolean;
  sortBy: SubjectSort;
};
