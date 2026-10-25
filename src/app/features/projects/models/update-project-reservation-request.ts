import { ReservationStatus } from "../../reservations"
import { ProjectItem } from "./project-item"

export type UpdateProjectReservationRequest = {
  id: number,
  studentId: string,
  totalPrice: number,
  reservationStatus: ReservationStatus,
  reservedAt: string,
  projectsToDelete: number[],
  projects: UpdateProjectItem[]
}

export type UpdateProjectItem = ProjectItem & {
  notesToDelete: number[]
}