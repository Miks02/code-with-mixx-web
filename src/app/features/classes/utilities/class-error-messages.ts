import { isProblemDetails } from '@core/utilities/problem-details-helpers';

export const CLASS_RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  'Student.NotFound': 'Izabrani student više ne postoji. Osveži stranicu i izaberi drugog.',
  'Subject.NotFound': 'Izabrani predmet više ne postoji. Osveži stranicu i izaberi drugi.',
  'Subject.MultipleSubjectsMissing':
    'Neki od izabranih predmeta više ne postoje. Osveži stranicu i izaberi ponovo.',
  'Reservation.NotFound': 'Rezervacija više ne postoji. Osveži stranicu.',
  'Reservation.NotAClassReservation': 'Izabrana rezervacija nije rezervacija časova.',
  'Reservation.NoClassesProvided': 'Rezervacija mora imati barem jedan čas.',
  'Reservation.ClassesOverlap': 'Časovi se ne smeju preklapati.',
  'Reservation.BreakDurationExceeded': 'Pauza između časova ne može biti duža od 60 minuta.',
  'Reservation.InvalidTotalPrice': 'Ukupna cena ne može biti negativna.',
  'Reservation.InvalidAmount': 'Plaćeni iznos ne može biti negativan.',
  'Reservation.InvalidReservedAt': 'Datum rezervacije ne može biti prazan ni u budućnosti.',
  'Reservation.DescriptionTooLong': 'Opis rezervacije je predugačak.',
  'Reservation.AlreadyDeleted': 'Rezervacija je već arhivirana. Osveži stranicu.',
  'Reservation.NotArchived': 'Rezervacija nije u arhivi. Osveži stranicu.',
  'Reservation.CantUpdateAnArchivedReservation': 'Nije moguće izmeniti arhiviranu rezervaciju.',
  'Reservation.RequiresHistoryRetention':
    'Rezervacija ne može biti trajno obrisana jer zahteva čuvanje istorije.',
  'Class.NotFound': 'Čas više ne postoji. Osveži stranicu.',
  'Class.InvalidSchedule': 'Početak časa mora biti pre njegovog kraja.',
  'Class.InvalidPrice': 'Cena časa mora biti veća od 0 RSD.',
  'Class.InvalidDuration': 'Čas ne može trajati duže od 45 minuta.',
  'Class.InvalidReservationDate': 'Datum rezervacije mora biti pre početka časa.',
  'Class.AlreadyDeleted': 'Čas je već arhiviran. Osveži stranicu i pokušaj ponovo.',
  'Class.NotArchived': 'Čas nije u arhivi. Osveži stranicu i pokušaj ponovo.',
  'Class.ReservationArchived':
    'Čas nije moguće vratiti jer je njegova rezervacija arhivirana. Vrati rezervaciju iz arhive.',
};

export function getClassReservationErrorMessage(err: unknown): string | undefined {
  if (!isProblemDetails(err)) return undefined;

  if (err.status === 400 && err.errors)
    return 'Podaci rezervacije nisu ispravni. Proveri polja forme.';

  return CLASS_RESERVATION_ERROR_MESSAGES[err.errorCode];
}
