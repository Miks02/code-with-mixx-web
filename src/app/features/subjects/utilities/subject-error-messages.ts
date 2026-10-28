import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const SUBJECT_ERROR_MESSAGES: Record<string, string> = {
  'Subject.NotFound': 'Predmet više ne postoji. Osveži stranicu.',
  'Subject.AlreadyArchived': 'Predmet je već arhiviran.',
  'Subject.NotArchived': 'Predmet nije arhiviran.',
  'Subject.HasClasses':
    'Predmet ne može biti obrisan jer ima povezane časove. Arhiviraj ga umesto brisanja.',
};

export function getSubjectErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors)
    return 'Podaci predmeta nisu ispravni. Proveri polja forme.';

  return SUBJECT_ERROR_MESSAGES[err.errorCode];
}
