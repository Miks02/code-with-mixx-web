import { AccountStatus } from '@core/models/account-status';
import { StatusMeta } from '@features/reservations';

export const ACCOUNT_STATUS_META: Record<AccountStatus, StatusMeta> = {
  [AccountStatus.Active]: { label: 'Aktivan', classes: 'bg-emerald-900/80 text-emerald-100' },
  [AccountStatus.Pending]: { label: 'Na čekanju', classes: 'bg-amber-900/60 text-amber-100' },
  [AccountStatus.Deactivated]: {
    label: 'Deaktiviran',
    classes: 'bg-orange-950/60 text-orange-100',
  },
  [AccountStatus.Deleted]: { label: 'Obrisan', classes: 'bg-red-950/60 text-red-100' },
};
