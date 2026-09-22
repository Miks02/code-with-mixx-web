import { StudentFilter } from "./student-filter";
import { StudentSort } from "./student-sort";

export type StudentQueryParams = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortBy: StudentSort;
  filters: StudentFilter[];
  includeDeleted: boolean;
}