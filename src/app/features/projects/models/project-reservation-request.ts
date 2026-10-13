import { ReservationStatus } from "../../reservations"
import { ProjectItem } from "./project-item";

export type ProjectReservationRequest = {
  studentId: string,
  paidAmount: number,
  totalPrice: number,
  reservationStatus: ReservationStatus,
  projects: ProjectItem[]
}