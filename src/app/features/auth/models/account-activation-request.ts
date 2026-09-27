import { AccountActivationBody } from './account-activation-body';
import { AccountActivationQuery } from './account-activation-query';

export type AccountActivationRequest = AccountActivationQuery & AccountActivationBody;
