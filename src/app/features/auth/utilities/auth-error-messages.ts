import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Auth.AccountDeactivated': 'Tvoj nalog je deaktiviran. Obrati se administratoru.',
  'Auth.InvalidInvitationToken':
    'Link za aktivaciju nije validan ili je istekao. Obrati se administratoru za novu pozivnicu.',
  'Auth.InvalidPasswordResetToken':
    'Došlo je do greške prilikom resetovanja lozinke. Token nije validan.',
  'Auth.PasswordTooShort': 'Lozinka je prekratka.',
  'Auth.PasswordRequiresDigit': 'Lozinka mora sadržati barem jednu cifru.',
  'Auth.PasswordRequiresUpper': 'Lozinka mora sadržati barem jedno veliko slovo.',
  'Auth.PasswordRequiresNonAlphanumeric': 'Lozinka mora sadržati barem jedan specijalni karakter.',
  'User.NotFound': 'Korisnik nije pronađen. Proveri link iz pozivnice.',
};

export function getAuthErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors) return 'Podaci nisu ispravni. Proveri polja forme.';

  return AUTH_ERROR_MESSAGES[err.errorCode];
}
