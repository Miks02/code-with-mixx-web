import { PagedResult } from "../../../core/models/paged-result";
import { StudentItem } from "./student-item";

export type StudentsSummary = {
  activeStudents: number,
  deletedStudents: number,
  pendingStudents: number,
  deactivatedStudents: number,
  pagedStudents: PagedResult<StudentItem>,
  mostActiveStudent: Omit<StudentItem, "deletedAt">
}