import { AccountStatus } from './account-status';
import { ActiveSession } from './active-session';

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  lastLogin: string;
  wasLoggedBefore: boolean;
  accountStatus: AccountStatus;
  activeSessions: ActiveSession[];
  university: string | null;
};
