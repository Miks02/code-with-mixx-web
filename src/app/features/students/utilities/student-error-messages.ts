import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const STUDENT_ERROR_MESSAGES: Record<string, string> = {
  'Student.NotFound': 'Došlo je do greške. Student nije pronađen.',
  'User.NotFound': 'Došlo je do greške. Korisnik nije pronađen.',
  'User.NotAStudent': 'Pozivnica se može poslati samo studentu.',
  'Auth.AccountDeactivated':
    'Nalog izabranog studenta je deaktiviran. Slanje pozivnice nije moguće.',
};

export function getStudentErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors)
    return 'Podaci studenta nisu ispravni. Proveri polja forme.';

  return STUDENT_ERROR_MESSAGES[err.errorCode];
}
