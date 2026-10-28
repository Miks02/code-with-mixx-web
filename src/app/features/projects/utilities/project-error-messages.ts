import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const PROJECT_RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  'Student.NotFound': 'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.',
  'Subject.MultipleSubjectsMissing':
    'Neki od izabranih predmeta više ne postoje. Osveži stranicu i izaberi ponovo.',
  'Reservation.NoProjectsProvided': 'Rezervacija mora imati barem jedan projekat.',
  'Reservation.InvalidTotalPrice': 'Ukupna cena ne može biti negativna.',
  'Reservation.InvalidAmount': 'Plaćeni iznos ne može biti negativan.',
  'Project.NegativePrice': 'Cena projekta ne može biti negativna.',
  'Project.InvalidProgress': 'Napredak projekta mora biti između 0 i 100.',
  'Project.InvalidDateRange': 'Početak projekta ne može biti posle roka.',
  'Project.InvalidReservationDate': 'Datum rezervacije ne može biti u budućnosti.',
  'Project.GithubLinkIsTooLong': 'Github link ne može imati više od 200 karaktera.',
  'Project.DownloadLinkIsTooLong': 'Download link ne može imati više od 200 karaktera.',
  'Project.EmptyProjectNote': 'Beleške ne mogu biti prazne.',
  'Reservation.NotFound': 'Rezervacija više ne postoji. Osveži stranicu.',
  'Project.NotFound': 'Projekat više ne postoji. Osveži stranicu.',
  'Project.NoteNotFound': 'Neka od beleški više ne postoji. Osveži stranicu i pokušaj ponovo.',
  'Project.CantUpdateAnArchivedProject': 'Nije moguće izmeniti arhiviran projekat.',
  'Reservation.CantUpdateAnArchivedReservation':
    'Nije moguće izmeniti projekat iz arhivirane rezervacije.',
  'Reservation.RequiresHistoryRetention':
    'Rezervacija ne može biti trajno obrisana jer zahteva čuvanje istorije.',
};

export function getProjectReservationErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors)
    return 'Podaci rezervacije nisu ispravni. Proveri polja forme.';

  return PROJECT_RESERVATION_ERROR_MESSAGES[err.errorCode];
}
