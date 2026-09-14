import { PagedResult } from "../../../core/models/paged-result";
import { SubjectItem } from "./subject-item";

export type SubjectsSummary = {
  totalSubjects: number,
  taughtSubjects: number,
  untaughtSubjects: number,
  mostPopularSubject: SubjectItem | null,
  pagedSubjects: PagedResult<SubjectItem>
}