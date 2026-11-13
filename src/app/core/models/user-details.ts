import { AccountStatus } from './account-status';
import { ActiveSession } from './active-session';

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  lastLogin: string;
  accountStatus: AccountStatus;
  activeSessions: ActiveSession[];
};
