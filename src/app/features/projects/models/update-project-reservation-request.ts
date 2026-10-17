import { ReservationStatus } from "../../reservations"
import { ProjectItem } from "./project-item"

export type UpdateProjectReservationRequest = {
  id: number,
  studentId: string,
  paidAmount: number,
  totalPrice: number,
  reservationStatus: ReservationStatus,
  projectsToDelete: number[],
  projects: ProjectItem[]
}