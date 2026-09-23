import { AccountStatus } from '../../../core/models/account-status';

export type StudentItem = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  university: string | null,
  totalReservations: number,
  totalClasses: number,
  totalProjects: number,
  registeredAt: string,
  deletedAt: string | null,
  accountStatus: AccountStatus
}