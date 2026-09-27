import { AccountStatus } from './account-status';

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  accountStatus: AccountStatus;
}