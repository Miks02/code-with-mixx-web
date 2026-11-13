import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const SETTINGS_ERROR_MESSAGES: Record<string, string> = {
  'User.NotFound': 'Tvoj nalog nije pronađen. Prijavi se ponovo.',
  'User.CannotUpdatePhoneNumber': 'Broj telefona trenutno nije moguće izmeniti. Pokušaj ponovo.',
  'Auth.CannotChangeEmailToSameEmail': 'Novi email je isti kao trenutni.',
  'Auth.EmailAlreadyInUse': 'Ovaj email već koristi drugi nalog.',
  'Auth.InvalidCurrentPassword': 'Trenutna lozinka nije ispravna.',
  'Auth.InvalidEmailResetToken': 'Kod za promenu emaila nije ispravan ili je istekao.',
};

export function getSettingsErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors) return 'Podaci nisu ispravni. Proveri polja forme.';

  return SETTINGS_ERROR_MESSAGES[err.errorCode];
}
